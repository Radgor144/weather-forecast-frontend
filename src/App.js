import React, { useState, useEffect } from "react";
import './App.css';
import WeatherTable from "./components/WeatherTable";
import Summary from "./components/Summary";
import Loading from "./components/Loading";
import Error from "./components/Error";
import Map from "./components/Map"; // Assuming you have Map component

const fetchWeatherData = async (latitude, longitude) => {
  const response = await fetch(`https://weatherforecastapi-1.onrender.com/forecast?latitude=${latitude}&longitude=${longitude}`);
  if (!response.ok) throw new Error("Failed to fetch weather data");
  return response.json();
};

const fetchSummary = async (latitude, longitude) => {
  const response = await fetch(`https://weatherforecastapi-1.onrender.com/summary?latitude=${latitude}&longitude=${longitude}`);
  if (!response.ok) throw new Error("Failed to fetch summary data");
  return response.json();
};

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState({ latitude: 50.06, longitude: 19.93 });
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => alert("Nie udało się pobrać lokalizacji. Użyję lokalizacji domyślnej.")
      );
    } else {
      alert("Geolokalizacja nie jest obsługiwana w tej przeglądarce.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (location.latitude && location.longitude) {
        setIsLoading(true);
        setError(null);
        try {
          const weather = await fetchWeatherData(location.latitude, location.longitude);
          const summaryData = await fetchSummary(location.latitude, location.longitude);
          setWeatherData(weather.proccessedData);
          setSummary(summaryData);
        } catch (err) {
          console.error("Error fetching data", err);
          setError("Wystąpił błąd podczas pobierania danych.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [location]);

  useEffect(() => getLocation(), []);

  // Funkcja przełączająca tryb ciemny
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  // Funkcja obsługująca kliknięcie na mapie
  const handleClickLocation = async (lat, lng) => {
    try {
      // Wysyłanie zapytania do API przy kliknięciu
      const weather = await fetchWeatherData(lat, lng);
      const summaryData = await fetchSummary(lat, lng);
      setWeatherData(weather.proccessedData);
      setSummary(summaryData);
      setLocation({ latitude: lat, longitude: lng });  // Zaktualizuj lokalizację
    } catch (err) {
      console.error("Error fetching data for clicked location", err);
      setError("Wystąpił błąd podczas pobierania danych.");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pl-PL').replace(/\./g, '/');
  const formatSunshineDuration = (seconds) => `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <h1 className={isDarkMode ? 'dark-mode' : ''}>Weather Forecast</h1>

      {/* Wyświetlanie współrzędnych na górze strony */}
      <div className="coordinates" style={{ marginBottom: '20px', fontSize: '16px' }}>
        <strong>Current Location: </strong> Latitude: {location.latitude}, Longitude: {location.longitude}
      </div>

      <button onClick={toggleDarkMode} style={{ margin: '20px 0', padding: '10px 15px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px' }}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      {error && <Error message={error} />}
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          {weatherData && <WeatherTable weatherData={weatherData} formatDate={formatDate} />}
          {summary && <Summary summary={summary} formatSunshineDuration={formatSunshineDuration} />}
          {/* Only render the map if location data is available */}
          {location.latitude && location.longitude && <Map latitude={location.latitude} longitude={location.longitude} onClickLocation={handleClickLocation} />}
        </div>
      )}
    </div>
  );
};

export default App;
