# C++ Basic Calculator

A feature-rich calculator with a C++ backend using cpp-httplib and an interactive HTML/CSS/JS frontend. Supports full keyboard input and includes a calculation history tape feature.

## Project Structure
```
CppCalculator/
├── httplib.h          # cpp-httplib header (single-file HTTP library)
├── src/
│   └── main.cpp       # C++ backend server
├── web/
│   ├── index.html     # Calculator interface
│   ├── style.css      # Styling
│   └── script.js      # Frontend logic
├── calculator.exe     # Compiled executable (Windows)
└── README.md          # This file
```

## Features

### Core Functionality
- **C++ Backend:** Fast calculation processing using cpp-httplib
- **All Basic Operations:** Addition, subtraction, multiplication, and division
- **Number Support:** Positive numbers, negative numbers, and decimals
- **Input Methods:** On-screen calculator buttons AND full keyboard support
- **Modern UI:** Clean, responsive design with gradient background and smooth animations

### Keyboard Support
The calculator accepts the following keyboard inputs:
- **Number Keys:** `0-9` - Enter digits
- **Decimal Point:** `.` - Add decimal point
- **Operations:** 
  - `+` - Addition
  - `-` - Subtraction
  - `*` - Multiplication
  - `/` - Division
- **Calculate:** `Enter` - Compute the result
- **Clear:** `Escape` - Clear all (C button)
- **Delete:** `Backspace` - Remove last digit

All other keys are ignored to prevent accidental input.

### History Tape
- **Toggle Visibility:** View/Hide calculation history with a button click
- **Receipt-Style Display:** Monospaced font with a classic receipt appearance
- **Format:** Shows calculations as `[First Input] [Operator] [Second Input] = [Result]`
- **Persistent Storage:** Keeps last 50 calculations in memory
- **Clear Function:** Remove all history with one click
- **Auto-scroll:** Newest calculations appear at the top

### Layout Design
- **Container Width:** 70% of viewport (responsive)
- **History Hidden:** Calculator centered in container
- **History Visible:** 
  - 20% - History Tape (left)
  - 5% - Gap
  - 75% - Calculator (right)
- **Mobile Responsive:** Stacks vertically on smaller screens

### Error Handling
- **Division by Zero:** Gracefully handled with error message
- **Invalid Operations:** Server-side validation
- **Connection Issues:** Clear error feedback to user
- **Input Validation:** Prevents invalid characters

## Prerequisites

- C++ compiler (g++, clang++, or MSVC)
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Windows: MinGW, Visual Studio, or similar C++ development environment
- Linux/Mac: GCC or Clang with pthread support

## Building and Running

### Windows - Using g++ (MinGW)
```bash
# Navigate to the project directory
cd CppCalculator

# Compile the C++ server
g++ -std=c++11 -pthread -o calculator src/main.cpp -lws2_32

# Run the server
calculator.exe
```

### Windows - Using Visual Studio (MSVC)
```bash
# Navigate to the project directory
cd CppCalculator

# Compile with MSVC
cl /EHsc /std:c++11 src/main.cpp /Fe:calculator.exe

# Run the server
calculator.exe
```

### Linux/Mac - Using g++
```bash
# Navigate to the project directory
cd CppCalculator

# Compile the C++ server
g++ -std=c++11 -pthread -o calculator src/main.cpp

# Run the server
./calculator
```

### Linux/Mac - Using clang++
```bash
# Navigate to the project directory
cd CppCalculator

# Compile the C++ server
clang++ -std=c++11 -pthread -o calculator src/main.cpp

# Run the server
./calculator
```

## Usage

1. **Start the Backend Server:**
   - Run the compiled executable
   - The server will start on `http://localhost:8080`
   - Console output: "Starting C++ Calculator Server on http://localhost:8080"

2. **Open the Calculator:**
   - Open your web browser
   - Navigate to `http://localhost:8080`
   - The calculator interface will load automatically

3. **Perform Calculations:**
   
   **Method 1: Mouse/Touch Input**
   - Click number buttons to enter values
   - Click operation buttons (+, −, ×, ÷)
   - Click equals (=) to calculate
   - Use C to clear, CE to clear entry, ⌫ to backspace
   
   **Method 2: Keyboard Input**
   - Type numbers directly (0-9)
   - Press `.` for decimal point
   - Press `+`, `-`, `*`, `/` for operations
   - Press `Enter` to calculate
   - Press `Escape` to clear all
   - Press `Backspace` to delete last digit

4. **View History:**
   - Click "View History Tape" button at the top
   - History tape appears on the left side
   - Shows all recent calculations in receipt format
   - Click "Clear" to erase history
   - Click "Hide History Tape" to collapse

## API Endpoint

### POST `/api/calculate`
Performs mathematical calculations on the backend.

**Request:**
- Content-Type: `application/x-www-form-urlencoded`
- Body: `num1=<number>&operation=<op>&num2=<number>`
- Operations: `add`, `subtract`, `multiply`, `divide`

**Response:**
- Success: `{"result": <number>}`
- Error: `{"error": "<message>"}`

**Example:**
```bash
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "num1=10&operation=multiply&num2=5"
```

Response: `{"result": 50}`

## Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Browser)            │
│  ┌─────────────────────────────────┐   │
│  │  HTML/CSS/JS Interface          │   │
│  │  - On-screen buttons            │   │
│  │  - Keyboard event handlers      │   │
│  │  - History tape display         │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ HTTP POST
                  │ (num1, operation, num2)
                  ▼
┌─────────────────────────────────────────┐
│         Backend (C++ Server)            │
│  ┌─────────────────────────────────┐   │
│  │  cpp-httplib HTTP Server        │   │
│  │  - Parse request                │   │
│  │  - Perform calculation          │   │
│  │  - Return JSON result           │   │
│  │  - Serve static files           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Technical Details

### Backend (C++)
- **HTTP Library:** cpp-httplib (single-header, no dependencies)
- **Server Port:** 8080
- **CORS:** Enabled for cross-origin requests
- **Static Files:** Served from `./web` directory
- **Calculations:** Double-precision floating-point arithmetic
- **Error Handling:** Try-catch blocks with meaningful error messages

### Frontend (JavaScript)
- **Vanilla JS:** No frameworks required
- **State Management:** In-memory calculator state
- **Event Handling:** Both click and keyboard events
- **History Storage:** Array-based in-memory storage (last 50 items)
- **API Communication:** Fetch API with async/await
- **Display:** Real-time updates with animations

### Styling (CSS)
- **Layout:** CSS Grid for calculator buttons, Flexbox for overall layout
- **Responsive:** Media queries for mobile devices
- **Theme:** Purple gradient background with modern card design
- **Typography:** 
  - Main UI: Segoe UI
  - History Tape: Courier New (monospaced)
- **Animations:** Smooth transitions and result updates

## Troubleshooting

### Server Issues
- **Port 8080 in use:** Change port in `main.cpp` (line 110) and `script.js` (line 19)
- **Compilation errors:** Ensure C++11 support and correct library flags
- **Server won't start:** Check firewall settings and port availability

### Browser Issues
- **Calculator not loading:** Verify server is running at `http://localhost:8080`
- **CORS errors:** Ensure server CORS headers are properly set
- **Keyboard not working:** Check browser console for JavaScript errors
- **History not showing:** Click "View History Tape" button

### Calculation Issues
- **Wrong results:** Check C++ backend calculation logic
- **Division by zero:** Should show error message (handled by backend)
- **Very large numbers:** Displayed in exponential notation

### Platform-Specific
**Windows:**
- Requires `-lws2_32` flag for socket support
- Use MinGW or MSVC compiler

**Linux/Mac:**
- Requires `-pthread` flag
- May need to install build-essential (Ubuntu/Debian)

## Browser Compatibility

- ✅ Chrome/Edge (Chromium) - Recommended
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ Internet Explorer - Not supported (use modern browser)

## Performance

- **Backend:** Handles calculations in microseconds
- **Frontend:** Smooth 60fps animations
- **History:** Efficient rendering for up to 50 items
- **Memory:** Lightweight, minimal resource usage

## Security Notes

- Runs on localhost only (not exposed to internet)
- No external dependencies or CDN requirements
- Input validation on both frontend and backend
- No data persistence (history cleared on page refresh)

## Future Enhancements (Potential)

- Scientific calculator mode
- Memory functions (M+, M-, MR, MC)
- History export (CSV, PDF)
- Themes and customization
- Calculation history persistence (localStorage)
- Advanced keyboard shortcuts
- Expression evaluation (e.g., "5+3*2")

## License

This project is for educational purposes. The cpp-httplib library is MIT licensed.

## Credits

- **cpp-httplib:** [yhirose/cpp-httplib](https://github.com/yhirose/cpp-httplib)
- **Design Inspiration:** Modern calculator UIs
- **Development:** Custom implementation for learning C++ backend development

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Verify all prerequisites are installed
3. Ensure the backend server is running
4. Check browser console for error messages
5. Review server console output for backend errors

---

**Version:** 2.0  
**Last Updated:** November 2025  
**Status:** Fully Functional ✅