let globalZoneData = [];
let zoneData = {}; // Nouveau tableau pour stocker les données de chaque zone
let lastSelectedZoneId = null; // Nouvelle variable globale pour stocker l'ID de la dernière zone sélectionnée

function fetchData() {
    // Make an AJAX call to fetch the data
    fetch('https://piscines-bordeaux.fr/src/server.php')
        .then(response => response.json())
        .then(data => {
            if (data && Array.isArray(data.results)) {
                globalZoneData = data.results;
                createZoneList(globalZoneData);
                // Stockez les données de chaque zone
                for (const zone of globalZoneData) {
                    zoneData[zone.id] = {
                        currentPercentage: (zone.fmicourante / zone.fmizonmax) * 100,
                        previousPercentage: null,
                    };
                }
                lastDataRefreshTime = new Date().toLocaleString();
                displayLastRefreshTime(); // Call the function to update the timestamp on the page
            	
  				// Rafraîchissez les détails de la zone sélectionnée, le cas échéant
                if (lastSelectedZoneId !== null) {
                    const selectedZone = globalZoneData.find(zone => zone.id === lastSelectedZoneId);
                    if (selectedZone) {
                        displayZoneDetails(selectedZone);
                    }
                }
			}
        })
        .catch(e => {
            console.error('Error fetching data:', e);
        });
}

function createZoneList(zones) {
    let zoneListDiv = document.getElementById('zoneList');
    zoneListDiv.innerHTML = '';
    zones.forEach((zone, index) => {
        // Combine the establishment and the zone into a single string
        let zoneText = `${zone.etablissement_etalib} - ${zone.fmizonlib}`;
        let zoneDiv = document.createElement('div');
        zoneDiv.textContent = zoneText;
        zoneDiv.className = 'clickable-zone';
        // Pass the index to the display function to access the stored data
        zoneDiv.onclick = function() {
            displayZoneDetails(globalZoneData[index]);
        };
        zoneListDiv.style.fontSize = '25px'; // Taille de police pour le sous-titre
        zoneListDiv.appendChild(zoneDiv);
    });
}

fetchData();
setInterval(fetchData, 15 * 60 * 1000);

function displayZoneDetails(zone) {
	lastSelectedZoneId = zone.id;
	
    let detailsDiv = document.getElementById('zoneDetails');
    detailsDiv.innerHTML = ''; // Clear previous details

    const currentFmi = zone.fmicourante; // Assurez-vous que cette propriété existe sur votre objet zone
    const maxFmi = zone.fmizonmax; // Assurez-vous que cette propriété existe sur votre objet zone
    const percentage = (currentFmi / maxFmi) * 100;
    const radius = 240; // Nouveau rayon pour le SVG agrandi
    const circleCircumference = 2 * Math.PI * radius; // Nouvelle circonférence pour le rayon agrandi
    const offset = circleCircumference - (circleCircumference * percentage / 100);
    const circleColor = getCircleColor(percentage); // Utilisez la fonction getCircleColor pour obtenir la couleur
    const lastRefresh = new Date(zone.datemiseajour).toLocaleString();
    const currentPercentage = (zone.fmicourante / zone.fmizonmax) * 100;
    const trendIcon = getTrendIcon(currentPercentage, zoneData[zone.id].previousPercentage);
    zoneData[zone.id].previousPercentage = currentPercentage;

    // Construisez le titre avec le nom de la piscine et la zone
    let poolTitle = document.createElement('div');
    poolTitle.className = 'pool-title';
    poolTitle.innerText = `${zone.etablissement_etalib} - ${zone.fmizonlib}`;
    poolTitle.style.fontSize = '40px'; // Taille de police pour le titre
    poolTitle.style.fontWeight = 'bold'; // Set the font weight to bold
    poolTitle.style.color = '#033988'; // Couleur du texte pour le titre
    poolTitle.style.marginBottom = '10px'; // Espace sous le titre

    // Construisez le sous-titre pour la date de dernier rafraîchissement
    let refreshSubtitle = document.createElement('div');
    refreshSubtitle.className = 'refresh-subtitle';
    refreshSubtitle.innerText = `Dernière mise à jour : ${lastRefresh}`;
    refreshSubtitle.style.fontSize = '30px'; // Taille de police pour le sous-titre
    refreshSubtitle.style.fontWeight = 'bold'; // Set the font weight to bold
    refreshSubtitle.style.color = '#033988'; // Couleur du texte pour le sous-titre
    refreshSubtitle.style.marginBottom = '20px'; // Espace sous le sous-titre

    // Ajoutez le titre et le sous-titre au conteneur de détails
    detailsDiv.appendChild(poolTitle);
    detailsDiv.appendChild(refreshSubtitle);

    // Create a container for the "Tendance" text and the trend icon
    let trendContainer = document.createElement('div');
    trendContainer.className = 'trend-container';
    trendContainer.style.display = 'flex'; // Set the display to flex
    trendContainer.style.alignItems = 'center'; // Center items vertically
    trendContainer.style.justifyContent = 'start'; // Align items to the start of the container

    // Add the "Tendance" text
    let trendText = document.createElement('div');
    trendText.innerText = 'Tendance : ';
    trendText.className = 'trend-text';
    trendText.style.fontSize = '30px'; // Taille de police pour le sous-titre
    trendText.style.fontWeight = 'bold'; // Set the font weight to bold
    trendText.style.color = '#033988'; // Couleur du texte pour le sous-titre
    trendText.style.marginBottom = '10px'; // Espace sous le sous-titre
    trendText.style.flexShrink = '0'; // Prevent the text from shrinking
    

    // Add the trend icon to the details div
    const trendIconElement = document.createElement('img');
    trendIconElement.src = trendIcon;
    trendIconElement.className = 'trend-icon';
    trendIconElement.style.flexShrink = '0'; // Prevent the icon from shrinking
    trendIconElement.style.marginLeft = '10px'; // Add some space between text and icon

    // Adjust the size of the image if necessary
    trendIconElement.style.maxWidth = '60%'; // Replace with desired width
    trendIconElement.style.maxHeight = '60%'; // Replace with desired height

    // Add the text and trend icon to the container
    trendContainer.appendChild(trendText);
    trendContainer.appendChild(trendIconElement);
    detailsDiv.appendChild(trendContainer);


    // SVG conteneur
    let svgContainer = document.createElement('div');
    svgContainer.className = 'affluence-svg-container';

    // SVG lui-même
    let svgHTML = `
        <svg viewBox="0 0 600 600" width="600" height="600" xmlns="http://www.w3.org/2000/svg">
            <circle class="circle-background" cx="300" cy="300" r="${radius}" />
            <circle class="circle-foreground" cx="300" cy="300" r="${radius}"
                stroke-dasharray="${circleCircumference}" stroke-dashoffset="${offset}" stroke="${circleColor}" />
            <text x="300" y="300" class="affluence-text" text-anchor="middle" alignment-baseline="middle" dy=".3em">
                ${currentFmi} / ${maxFmi} personnes
            </text>
        </svg>
    `;

    svgContainer.innerHTML = svgHTML;
    detailsDiv.appendChild(svgContainer);
}


function getCircleColor(percentage) {
    // Couleurs de début, milieu et fin
    const startColor = { r: 0, g: 180, b: 126 }; // Vert
    const middleColor = { r: 237, g: 186, b: 66 }; // Jaune
    const endColor = { r: 228, g: 59, b: 87 }; // Rouge

    // Calculer la couleur en fonction du pourcentage
    let color;
    if (percentage <= 50) {
        color = interpolateColor(startColor, middleColor, percentage / 50);
    } else {
        color = interpolateColor(middleColor, endColor, (percentage - 50) / 50);
    }

    // Convertir en chaîne de couleur hexadécimale
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}
function interpolateColor(color1, color2, factor) {
    if (factor > 1) factor = 1;
    const result = {
        r: Math.round(color1.r + factor * (color2.r - color1.r)),
        g: Math.round(color1.g + factor * (color2.g - color1.g)),
        b: Math.round(color1.b + factor * (color2.b - color1.b))
    };
    return result;
}

function getTrendIcon(currentPercentage, previousPercentage) {
    if (previousPercentage === null) {
        return '../svg/fleche_affluence_stagne.svg'; // Path to steady trend icon
    }
    
    const diffPercentage = currentPercentage - previousPercentage;
  
	console.log("previousPercentage:"+previousPercentage);
	console.log("currentPercentage:"+currentPercentage);
	console.log("diffPercentage:"+diffPercentage);
  
    if (diffPercentage > 2) {
      return '../svg/fleche_affluence_monte.svg'; // Remplacez par votre chemin réel
    } else if (diffPercentage < -2) {
      return '../svg/fleche_affluence_baisse.svg'; // Remplacez par votre chemin réel
    } else {
      return '../svg/fleche_affluence_stagne.svg'; // Remplacez par votre chemin réel
    }
}

function displayLastRefreshTime() {
    // Check if the last refresh info element already exists, if not create it
    let lastRefreshInfo = document.getElementById('last-refresh-info');
    if (!lastRefreshInfo) {
        lastRefreshInfo = document.createElement('div');
        lastRefreshInfo.id = 'last-refresh-info';
        lastRefreshInfo.style.position = 'absolute';
        lastRefreshInfo.style.bottom = '10px'; // Adjust as needed
        lastRefreshInfo.style.right = '10px'; // Adjust as needed
        lastRefreshInfo.style.fontSize = '20px'; // Adjust as needed
        lastRefreshInfo.style.color = '#FFFFFF'; // Change as per your page's color scheme
        document.body.appendChild(lastRefreshInfo); // Append it to the body or a main container with relative position
    }
    // Set or update the text of the last refresh info element
    lastRefreshInfo.innerText = `Dernier rafraîchissement : ${lastDataRefreshTime}`;
}
