const memberListEl = document.querySelector(".member-list");


let loadedMembers = 0; //Track the Number of Loaded members
let totalLoadedMembers = 0; // Track total loaded members from "See More"
const membersPerPage = 6; // Number of Members to load each time
let allMembers = []; // Store all members for searching


async function result() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const pageContent = document.querySelector(".page-content")
    const seeMoreBtn = document.querySelector(".see-more--btn")

    try {
        // Hide "See More" button during loading
        if (seeMoreBtn) seeMoreBtn.style.display = 'none';

        // change body background to black before showing loading state
        document.body.style.backgroundColor = 'linear-gradient(to top, black, transparent)';

        // Show loading state before fetching member data
        console.log('showing loading overlay')
        loadingOverlay.classList.add('show'); //trigger fade-in
        loadingOverlay.style.display = 'flex'; //ensure it's displayed

        const response = await fetch("https://discord.com/api/guilds/1192620302908264548/widget.json");
        const membersData = await response.json();
        const memberLength = membersData.members.length;


        // Check if data is being fetched
        console.log("Members fetched:", membersData);
        console.log("Total members:", memberLength);

        // Step 1: Render the Slider HTML AFTER the data is fetched
        const sliderContainerEL = document.querySelector(".character__filter--container");
        console.log("Slider container found:", sliderContainerEL); // Debug
        sliderContainerEL.innerHTML = sliderHTML(memberLength); // Call sliderHTML with memberLength

        // Now that slider is rendered, get references to the slider input elements
        const inputElements = document.querySelectorAll(".slider");
        console.log("Slider inputs found:", inputElements); // Debug

        // Initialize slider event listeners and range validation
        sliderChange(inputElements, membersData.members); // Add slider event listeners
        validateRange(inputElements, memberLength); // Set Initial slider range validation

        // Step 2: Filter the members based on the slider values (minPrice, maxPrice)
        let minPrice = parseInt(inputElements[0].value); // Slider Minimum Value
        let maxPrice = parseInt(inputElements[1].value); // Slider Maximum Value
        allMembers = membersData.members
        filterAndRenderMembers(allMembers, minPrice, maxPrice, false); // Explicitly pass `false` in order to not accidentally reference an undefined fromSeeMore

        // === ADD SEARCH LOGIC HERE ===

        // Get the search input and button
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');

        // Function to perform search
        function searchWithField() {
            const searchValue = searchInput.value.toLowerCase();
            const filteredMembers = allMembers.filter(member => member.status.toLowerCase().includes(searchValue))

            // re-render the filtered members based on search
            filterAndRenderMembers(filteredMembers, parseInt(document.querySelector('.min-price').value), parseInt(document.querySelector('.max-price').value), false)
        }

        // Trigger search on typing in the search input
        searchInput.addEventListener('input', searchWithField);

        // trigger search when clicking the magnifying glass
        searchButton.addEventListener('click', searchWithField);

    } catch (error) {
        console.error("Error fetching or rendering members:", error); // Log any potential errors
    } finally {
        // Hide the overlay after the fetch completes
        loadingOverlay.classList.remove('show'); // trigger fade-out

        // Change body background to the gradient over the same duration as the overlay fade-out
        document.body.style.background = 'linear-gradient(to top, transparent, rgba(0, 0, 0, .0))';

        // Set timeout to wait for the overlay to fully fade out before resetting the background
        setTimeout(() => {
            loadingOverlay.style.display = 'none'; // Completely hide it after fade-out

            // Show the member cards container and apply fade-in
            memberListEl.style.display = 'flex';
            memberListEl.classList.add('show-members');

            // Optionally, reset the body background color after loading
            document.body.style.backgroundColor = ''; // Reset to original background color
            pageContent.classList.add('fade-in'); // Trigger Fade-in for the page content

            // Show "See More" button after loading completes if more memers exist
            if (allMembers.length > membersPerPage) {
                const inputElements = document.querySelectorAll(".slider");
                const minPrice = parseInt(inputElements[0].value);
                const maxPrice = parseInt(inputElements[1].value);
                renderSeeMoreButton(allMembers, minPrice, maxPrice);
            }
        }, 4000);
    }
}

function filterAndRenderMembers(members, minPrice, maxPrice, fromSeeMore = false) {
    // Filter members based on the slider values
    const filteredMembers = members.filter((member) => {
        return parseInt(member.id) >= minPrice && parseInt(member.id) <= maxPrice;
    });

    console.log("Filtered members:", filteredMembers); // Debug log

    // Clear existing members if this isn't triggered by the "See More" button
    if (!fromSeeMore) {
        memberListEl.innerHTML = '';
        loadedMembers = 0;
        totalLoadedMembers = 0;
    }

    // If no results are found
    if (filteredMembers.length === 0) {
        memberListEl.innerHTML = `
            <div class="no-results--container">
                <img src="./images/freepik__candid-image-photography-natural-textures-highly-r__80078.jpeg" alt="No Results Found" class="no-results--image">
                <p>No members were found matching this online status</p>
                <button id="reset-filter-btn" class="reset-filter--btn">Reset Filter</button>
            </div>
        `;

        // Hide the "See More" button if no members found
        const seeMoreBtn = document.querySelector(".see-more--btn");
        if (seeMoreBtn) seeMoreBtn.style.display = 'none';

        // Add an event listener to the "Reset Filter" button
        const resetFilterBtn = document.getElementById("reset-filter-btn");
        if (resetFilterBtn) {
            resetFilterBtn.addEventListener("click", () => {
                // Reset the sliders to their default values
                const inputElements = document.querySelectorAll(".slider");
                inputElements[0].value = 0;
                inputElements[1].value = allMembers.length;

                validateRange(inputElements, allMembers.length); // Update slider display

                // Clear the Search input field
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = ''; // Clear the search input
                }
                

                filterAndRenderMembers(allMembers, 0, allMembers.length, false); // Re-render all members
            });
        } else {
            console.error("Reset Filter button was not found in the DOM.");
        }

        return; // Exit since there are no results to display
    }

    // Render the next set of members without clearing the existing ones
    const membersToRender = filteredMembers.slice(loadedMembers, loadedMembers + membersPerPage);
    loadedMembers += membersToRender.length;
    totalLoadedMembers += membersToRender.length;

    // Append rendered members to the container
    memberListEl.innerHTML += membersToRender.map((member) => memberHTML(member)).join('');

    // Check if there are more members to load and toggle "See More" button visibility
    const seeMoreBtn = document.querySelector(".see-more--btn");
    if (totalLoadedMembers >= filteredMembers.length) {
        if (seeMoreBtn) seeMoreBtn.style.display = 'none';
    } else {
        if (seeMoreBtn) seeMoreBtn.style.display = 'block';
    }

}




function renderSeeMoreButton(members, minPrice, maxPrice) {
    // Check if the button already exists
    let seeMoreBtn = document.querySelector(".see-more--btn");
    if (!seeMoreBtn) {
        // Create the "See More" button
        seeMoreBtn = document.createElement("button");
        seeMoreBtn.classList.add("see-more--btn");
        seeMoreBtn.innerHTML = "See More";

        // Add event listener to load more members on click
        seeMoreBtn.addEventListener("click", () => {
            // minPrice and maxPrice correctly fetched from sliders
            const inputElements = document.querySelectorAll(".slider")
            minPrice = parseInt(inputElements[0].value);
            maxPrice = parseInt(inputElements[1].value)
            filterAndRenderMembers(members, minPrice, maxPrice, true);
        });

        // Append the button to the member list container
        memberListEl.parentElement.appendChild(seeMoreBtn);
    }
}

function memberHTML(members) {
    const avatarURL = members.avatar_url ? members.avatar_url.replace('http:', 'https:') : 'default-avatar-url'; //Fallback if avatar is missing
    console.log('avatar URL', avatarURL);


    return `
    <div class="member-card" onclick="showUserPosts(${members.id})">
        <div class="member-card__container">
            <h3>${members.username}</h3>
            <p><b>Status:</b> ${members.status}</p>
            <p><b>ID: </b> ${members.id}</p>
            <p><a href="${avatarURL}" target="_blank">
                <img class="player__avatar" src="${avatarURL}" alt="${members.username}'s Avatar"></a></p>
        </div>
    </div>`;
}

function sliderHTML(memberLength) {
    return ` 
    <div class="character-filter flex flex-col">
        <h2>
            User ID Range: &nbsp;<span class="range">
                <p id="min-value">0</p>&nbsp; to &nbsp;<p id="max-value">${memberLength}</p>
            </span>
        </h2>

        <div class="range-slider">
            <div class="range-fill"></div>
            <input type="range" class="min-price slider" value="0" min="0" max="${memberLength}" step="1">
            <input type="range" class="max-price slider" value="${memberLength}" min="0" max="${memberLength}" step="1">
            <div class="content">
                <div><p id="min-value-display">0</p></div>
                <div><p id="max-value-display">${memberLength}</p></div>
            </div>
        </div>
    </div>`;
}

function validateRange(inputElements, maxValue) {
    let minPrice = parseInt(inputElements[0].value);
    let maxPrice = parseInt(inputElements[1].value);

    if (minPrice > maxPrice) {
        [minPrice, maxPrice] = [maxPrice, minPrice]; // Swap Values
    }

    const minPercentage = (minPrice / maxValue) * 100;
    const maxPercentage = (maxPrice / maxValue) * 100;

    const rangeFill = document.querySelector(".range-fill");
    rangeFill.style.left = `${minPercentage}%`;
    rangeFill.style.width = `${maxPercentage - minPercentage}%`;

    document.getElementById("min-value-display").innerHTML = minPrice;
    document.getElementById("max-value-display").innerHTML = maxPrice;
}

function sliderChange(inputElements, members) {
    inputElements.forEach((element) => {
        element.addEventListener("input", () => {
            validateRange(inputElements, members.length);
        });
        element.addEventListener("change", () => {
            let minPrice = parseInt(inputElements[0].value);
            let maxPrice = parseInt(inputElements[1].value);
            loadedMembers = 0; // Reset loaded members
            totalLoadedMembers = 0; // reset total loaded members
            filterAndRenderMembers(members, minPrice, maxPrice);
        });
    });
}

result();
