document.addEventListener('DOMContentLoaded', function () {
    const setDummyDataButton = document.getElementById('setDummyDataButton');

    if (setDummyDataButton) {
        setDummyDataButton.addEventListener('click', function () {
            
            setDummyData();
        });
    }
	
	const loadButton = document.getElementById('loadButton');

    if (loadButton) {
        loadButton.addEventListener('click', function () {
            
            loadData();
        });
    }
	
	const avgButton = document.getElementById('avgButton');

    if (avgButton) {
        avgButton.addEventListener('click', function () {
            
            calculateParameterAverage();
        });
    }

    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(loadData);

     
function loadData() {
    const startDate = document.getElementById('startDate').value;
    const startTime = document.getElementById('startTime').value;
    const endDate = document.getElementById('endDate').value;
    const endTime = document.getElementById('endTime').value;

    const url = `/get_sensor_data?startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            
            drawLineChart('lineChart', 'Environmental Parameters', data.data);
					
            
            displayWarnings(data.data[data.data.length - 1]);		
       
        })
        .catch(error => console.error('Error fetching data:', error));	
		
}


function displayWarnings(latestData) {
    const warningContainer = document.getElementById('warningContainer');
    
    if (latestData) {
        
        const latestTemperature = latestData[1];
        const latestHumidity = latestData[2];
        const latestPh = latestData[3];
        const latestWater = latestData[4];
        const latestNutrient = latestData[5];

        
        const temperatureWarning = latestTemperature > 80 ? 'Warning: Temperature exceeds 80°F!' : 'Temperature is normal.';
        const humidityWarning = latestHumidity > 70 ? 'Warning: Humidity exceeds 70%!' : 'Humidity is normal.';
        const phWarning = latestPh > 6.7 ? 'Warning: pH level exceeds 6.7!' : 'pH level is normal.';
        const waterWarning = latestWater > 5 ? 'Warning: Water level exceeds 5 liters!' : 'Water level is normal.';
        const nutrientWarning = latestNutrient > 6.0 ? 'Warning: Nutrient level exceeds 6.0!' : 'Nutrient level is normal.';

        
        warningContainer.innerHTML = `
			<p><strong>Parameter Condition:</strong></p>
			<br>
            <p>${temperatureWarning}</p>
            <p>${humidityWarning}</p>
            <p>${phWarning}</p>
            <p>${waterWarning}</p>
            <p>${nutrientWarning}</p>
        `;
    } else {
        
        warningContainer.innerHTML = '<p>No data available.</p>';
    }
}


    function loadSensorData() {
        
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;
        const endDate = document.getElementById('endDate').value;
        const endTime = document.getElementById('endTime').value;

        
        const startTimestamp = startDate + ' ' + startTime + ':00';
        const endTimestamp = endDate + ' ' + endTime + ':00';

        
        fetch('/get_sensor_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`,
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);  
            drawLineChart('lineChart', 'Environmental Parameters', data.data);
        })
        .catch(error => console.error('Error fetching data:', error));
    }

    function drawLineChart(containerId, title, data) {
        var container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        var dataTable = google.visualization.arrayToDataTable(data);

        var options = {
            title: 'Line Chart: ' + title,
            vAxis: { title: 'Values' },
            hAxis: { title: 'Timestamp' },
            series: {}
        };

        var chart = new google.visualization.LineChart(container);
        chart.draw(dataTable, options);
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
	
});


function setDummyData() {
    const temperatureInput = document.getElementById('temperature-input').value;
    const humidityInput = document.getElementById('humidity-input').value;
    const phInput = document.getElementById('ph-input').value;
    const waterInput = document.getElementById('water-input').value;
	const nutrientInput = document.getElementById('nutrient-input').value;

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    
    const data = {
        temperature: temperatureInput,
        humidity: humidityInput,
        ph: phInput,
        water: waterInput,
		nutrient: nutrientInput
    };

    
    fetch('/set_dummy_data', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Dummy data set successfully:', data);

        
        window.location.href = '/Login';
    })
    .catch(error => {
        console.error('Error setting dummy data:', error);
    });
}
