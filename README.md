# DOM Debug 🕵️‍♂️

A **self-contained, vanilla JavaScript tool** for live DOM inspection and **on-the-fly style prototyping**.  
No dependencies, no setup headaches—just drop it into your project and start debugging instantly.

---

## 🚀 Features

- **Element inspection**

  - Hover over elements to highlight them.
  - Click an element to select it and view its details.

- **Live style editing**

  - Modify key CSS properties (e.g., `color`, `backgroundColor`, `border`, etc.) in real time.
  - Changes are applied immediately to the selected element.

- **Copy applied styles**

  - Extract inline styles of the selected element with one click.

- **Minimal UI**

  - Floating toggle button (`🔍`) to enable/disable inspector.
  - Side panel with a clean, dark theme.

- **Non-intrusive**
  - Does not interfere with existing page scripts.
  - Automatically prevents multiple instances from running.

---

## 📦 Installation

Simply include the script in your HTML file:

```html
<script src="dom-debug.js"></script>
```

No npm install, no bundlers—just pure JavaScript.

---

## 🖱️ Usage

1. Open your page in a browser with the script included.
2. Click the floating **🔍 toggle button** in the top-right corner.
3. Hover over elements to preview highlights.
4. Click on an element to:
   - View its **tag, ID, and classes**.
   - Open the **style editor** in the side panel.
5. Edit styles live by typing values into the inputs.
6. Copy applied styles with the **📋 Copy Applied Styles** button.
7. Close the inspector panel with the **×** button or toggle off with the floating button.

---

## 🎨 Editable Style Properties

The style editor supports quick editing of the following CSS properties:

- `backgroundColor`
- `color`
- `fontSize`
- `padding`
- `border`
- `borderRadius`

> 💡 More properties can easily be added in the script.

---

## ⚙️ Technical Notes

- **Isolation:**  
  The tool uses a unique prefix (`dom-debug`) for UI classes to prevent conflicts with your page styles.

- **Highlight Layers:**

  - **Blue solid border** → hovered element
  - **Green dashed border** → selected element

- **Event Handling:**

  - Uses `mousemove` for hover highlights.
  - Uses `click` (with capture phase) for element selection.
  - Stops propagation when selecting elements to avoid triggering site events.

- **Clipboard Support:**
  - Requires modern browser APIs (`navigator.clipboard`).

---

## 👩‍💻 Contributing

Contributions are welcome!
