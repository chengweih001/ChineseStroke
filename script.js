document.addEventListener('DOMContentLoaded', () => {
    const charInput = document.getElementById('charInput');
    const submitBtn = document.getElementById('submitBtn');
    const outputSection = document.getElementById('output-section');
    const printBtn = document.getElementById('printBtn'); // Get the print button

    // --- New function for vertical stroke sequence ---
    function renderVerticalStrokeSequence(targetContainer, strokes) {
        // Clear previous content if any
        targetContainer.innerHTML = '';
        const STROKE_SVG_SIZE = 30; // Smaller size for sequence
        const STROKE_SVG_PADDING = 2;

        strokes.forEach((_, index) => {
            const strokesPortion = strokes.slice(0, index + 1);
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.width = `${STROKE_SVG_SIZE}px`;
            svg.style.height = `${STROKE_SVG_SIZE}px`;
            // Add styles for border, margin-bottom in CSS for .stroke-step-svg
            svg.classList.add('stroke-step-svg'); // Add class for styling
            targetContainer.appendChild(svg);

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const transformData = HanziWriter.getScalingTransform(STROKE_SVG_SIZE, STROKE_SVG_SIZE, STROKE_SVG_PADDING);
            group.setAttributeNS(null, 'transform', transformData.transform);
            svg.appendChild(group);

            strokesPortion.forEach(strokePath => {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttributeNS(null, 'd', strokePath);
                path.style.fill = '#555';
                group.appendChild(path);
            });
        });
    }
    // --- End of new function ---

    submitBtn.addEventListener('click', async () => {
        const inputText = charInput.value.trim();
        if (!inputText) {
            alert('Please enter some characters.');
            return;
        }

        // Clear previous output
        outputSection.innerHTML = '';

        // 1. Process input and filter out whitespace
        const characters = Array.from(inputText).filter(char => !/\s/.test(char));
        if (characters.length === 0) return;

        // 2. Load data for all characters
        const characterDataPromises = characters.map(char =>
            HanziWriter.loadCharacterData(char).catch(err => {
                console.error(`Error loading data for character ${char}:`, err);
                return null; // Handle potential loading errors
            })
        );
        const characterDataArray = await Promise.all(characterDataPromises);

        // 3. Build the DOM structure
        characters.forEach((char, index) => {
            const charData = characterDataArray[index]; // Get pre-loaded data

            // Create the main column for this character
            const charColumn = document.createElement('div');
            charColumn.classList.add('char-column');

            // --- Character Header Section ---
            const charHeader = document.createElement('div');
            charHeader.classList.add('char-header');
            // Add a large grid for the character display (styling needed in CSS)
            const charDisplayGrid = document.createElement('div');
            charDisplayGrid.classList.add('char-display-grid');
            // Use HanziWriter to draw the character large in the header grid
            HanziWriter.create(charDisplayGrid, char, {
                width: 100, // Size for header display
                height: 100,
                padding: 5,
                showOutline: false, // Just show the character
                strokeColor: '#000'
            });
            charHeader.appendChild(charDisplayGrid);
            charColumn.appendChild(charHeader);

            // --- Stroke Sequence Section ---
            const strokeSequenceContainer = document.createElement('div');
            strokeSequenceContainer.classList.add('stroke-sequence-container');
            if (charData) {
                renderVerticalStrokeSequence(strokeSequenceContainer, charData.strokes);
            } else {
                // Handle case where character data failed to load
                const errorMsg = document.createElement('p');
                errorMsg.textContent = `Data unavailable`;
                errorMsg.classList.add('error-message'); // Add class for styling
                strokeSequenceContainer.appendChild(errorMsg);
            }
            charColumn.appendChild(strokeSequenceContainer);

            // --- Practice Grids Section ---
            const gridContainer = document.createElement('div');
            gridContainer.classList.add('practice-grid-container');
            const practiceGridCount = 5; // Number of practice grids per character
            for (let i = 0; i < practiceGridCount; i++) {
                const grid = document.createElement('div');
                grid.classList.add('practice-grid');
                // Grid lines will be added via CSS background
                gridContainer.appendChild(grid);
            }
            charColumn.appendChild(gridContainer);

            // Append the character column to the main output section
            outputSection.appendChild(charColumn);
        });

        // Add a class to the output section to enable grid/flex layout via CSS
        outputSection.classList.add('horizontal-layout');
    });

    // Optional: Allow pressing Enter in the input field to submit
    charInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission if it were in a form
            submitBtn.click(); // Trigger the button click
        }
    });

    // Add event listener for the print button
    printBtn.addEventListener('click', () => {
        window.print(); // Trigger the browser's print dialog
    });
});
