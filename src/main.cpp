#include "../httplib.h"
#include <iostream>
#include <string>
#include <sstream>

int main() {
    httplib::Server server;

    // Enable CORS for all routes
    server.set_pre_routing_handler([](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        return httplib::Server::HandlerResponse::Unhandled;
    });

    // Handle OPTIONS requests for CORS preflight
    server.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        return;
    });

    // Serve static files from web directory
    server.set_mount_point("/", "./web");

    // API endpoint for multiplication
    server.Post("/api/multiply", [](const httplib::Request& req, httplib::Response& res) {
        try {
            std::cout << "Received multiplication request: " << req.body << std::endl;

            // Parse the request body (expecting "num1=x&num2=y" format)
            std::string body = req.body;
            double num1 = 0, num2 = 0;

            // Simple parser for form data
            size_t num1_pos = body.find("num1=");
            size_t num2_pos = body.find("num2=");

            if (num1_pos != std::string::npos && num2_pos != std::string::npos) {
                // Extract num1
                size_t num1_start = num1_pos + 5; // Skip "num1="
                size_t num1_end = body.find("&", num1_start);
                if (num1_end == std::string::npos) num1_end = body.length();
                std::string num1_str = body.substr(num1_start, num1_end - num1_start);

                // Extract num2
                size_t num2_start = num2_pos + 5; // Skip "num2="
                size_t num2_end = body.find("&", num2_start);
                if (num2_end == std::string::npos) num2_end = body.length();
                std::string num2_str = body.substr(num2_start, num2_end - num2_start);

                // Convert to numbers
                num1 = std::stod(num1_str);
                num2 = std::stod(num2_str);

                // Calculate result
                double result = num1 * num2;

                std::cout << "Multiplying " << num1 << " * " << num2 << " = " << result << std::endl;

                // Return JSON response
                std::stringstream json_response;
                json_response << "{\"result\": " << result << "}";

                res.set_content(json_response.str(), "application/json");
            } else {
                res.status = 400;
                res.set_content("{\"error\": \"Invalid request format\"}", "application/json");
            }
        } catch (const std::exception& e) {
            std::cerr << "Error processing request: " << e.what() << std::endl;
            res.status = 500;
            res.set_content("{\"error\": \"Internal server error\"}", "application/json");
        }
    });

    // Start server
    std::cout << "Starting C++ Calculator Server on http://localhost:8080" << std::endl;
    std::cout << "Open your browser and navigate to http://localhost:8080" << std::endl;

    if (!server.listen("localhost", 8080)) {
        std::cerr << "Failed to start server!" << std::endl;
        return 1;
    }

    return 0;
}