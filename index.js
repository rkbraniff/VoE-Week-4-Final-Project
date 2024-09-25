let minValue = document.getElementById("min-value");
let maxValue = document.getElementById("max-value");

const rangeFill = document.querySelector(".range-fill")

// Function to validate range and update the fill color on the slider
function validateRange() {
    let minPrice = parseInt(inputElements[0].value);
    let maxPrice = parseInt(inputElements[1].value);
    
    //Swap the values if minPrice is greater than maxPrice
    if (minPrice > maxPrice) {
        let tempValue = maxPrice;
        maxPrice = minPrice;
        minPrice = tempValue;
    }

    //Calculate the percentage position for min and max values
    const minPercentage = (minPrice / 39) * 100;
    const maxPercentage = (maxPrice / 39) * 100;

    //Set the position and width of the fill color element to represent the selected range
    rangeFill.style.left = minPercentage + "%";
    rangeFill.style.width = maxPercentage - minPercentage + "%"

    //Update the displayed min/max values
    minValue.innerHTML = minPrice;
    maxValue.innerHTML = maxPrice;
}

// Get Reference to the input elements
const inputElements = document.querySelectorAll(".slider");
    
// Add an event listener to each element
inputElements.forEach((element) => {
    element.addEventListener("input", validateRange);
    element.addEventListener("change", result)
});

//Initial call to validate range
validateRange();

const memberListEl = document.querySelector(".member-list")

async function result() {
    const members = await fetch("https://discord.com/api/guilds/1192620302908264548/widget.json")
    const membersData = await members.json();
    
    let minPrice = parseInt(inputElements[0].value);
    let maxPrice = parseInt(inputElements[1].value);

    const filteredMembers = membersData.members.filter((member) => member.id <= maxPrice && member.id >= minPrice)
   
    memberListEl.innerHTML = filteredMembers.map((member) => memberHTML(member)).slice(0, 6).join('')
}

result();

function memberHTML(members) {
    

    return `<div class="member-card" onclick="showUserPosts(${members.id})">
    <div class="member-card__container">
        <h3>${members.username}</h3>
        <p><b>Status:</b> ${members.status}</p>
        <p><b>ID: </b> ${members.id}</p>
        <p><a href="https://${members.avatar_url}"><img class="player__avatar" src="${members.avatar_url}"></a></p>
    </div>
    </div>`
}

