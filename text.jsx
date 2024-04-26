// Create a window
var win = new Window("palette", "Drag to Change Text", undefined);
win.orientation = "column";

// Create a static text element
var staticText = win.add("statictext");
staticText.text = "Drag Me";
staticText.characters = 10; // Adjust according to your text length

// Variables to store initial position and mouse state
var isMouseDown = false;
var startX = 0;

// Function to update the text based on mouse movement
function updateText(mouseX) {
    var delta = mouseX - startX;
    var newTextValue = parseInt(staticText.text) + delta;
    staticText.text = newTextValue.toString();
}

// Event listener for mouse down
staticText.addEventListener("mousedown", function(event) {
    isMouseDown = true;
    startX = event.screenX;
});

// Event listener for mouse up
staticText.addEventListener("mouseup", function(event) {
    isMouseDown = false;
});

// Event listener for mouse move
staticText.addEventListener("mousemove", function(event) {
    if (isMouseDown) {
        updateText(event.screenX);
    }
});

// Show the window
win.show();
