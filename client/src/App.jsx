import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const BasketList = ({ baskets, onBasketClick }) => {
  return (
    <ul className="basket-list">
      {baskets.map((basket) => (
        <li key={basket.id}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBasketClick(basket.path_name);
            }}
          >
            {basket.path_name}
          </a>
        </li>
      ))}
    </ul>
  );
};

const BasketView = ({
  basketName,
  requests,
  onBackClick,
  lifetimeRequests,
  onDeleteBasket,
  onDeleteRequests,
  onRefreshRequests,
}) => {
  useEffect(() => {
    const pollRequests = async () => {
      try {
        const response = await axios.get(`/api/basket/${basketName}`);
        onRefreshRequests(response.data);
      } catch (error) {
        console.error('Error polling requests:', error);
      }
    };

    const interval = setInterval(pollRequests, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [basketName, onRefreshRequests]);

  return (
    <div>
      <div className="basket-view-buttons">
        <button onClick={onBackClick}>← Back to Baskets</button>
        <button onClick={() => onDeleteBasket(basketName)}>
          Delete Basket
        </button>
        <button onClick={() => onDeleteRequests(basketName)}>
          Delete Requests
        </button>
      </div>

      <h2>Basket: {basketName}</h2>
      <p>Current requests: {requests.length}</p>
      <p>Lifetime requests: {lifetimeRequests}</p>

      <div className="requests-container">
        {requests.length === 0 ? (
          <p>No requests yet</p>
        ) : (
          requests.slice().reverse().map((request) => (
            <div key={request.id} className="request-item">
              <div>
                <strong>Method:</strong> {request.method}
              </div>
              <div>
                <strong>Path:</strong> /{basketName}
              </div>
              <div>
                <strong>Time:</strong>{" "}
                {new Date(request.time_stamp).toLocaleString()}
              </div>
              <div>
                <strong>Headers:</strong>
              </div>
              <pre>{request.header}</pre>
              {request.mongodb_path && (
                <div>
                  <strong>Body:</strong>
                  <pre>Body stored in MongoDB (ID: {request.mongodb_path})</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CreateBasket = ({ onBasketCreated }) => {
  const [basketName, setBasketName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!basketName.trim()) return;

    try {
      const response = await axios.post(`/api/basket/${basketName}`);
      onBasketCreated(response.data);
      setBasketName("");
    } catch (error) {
      console.log("Error when creating basket:", error);
      if (error.response?.status === 409) {
        alert("Failed to create basket: basket name must be unique");
      } else {
        alert("Failed to create basket: please try again later");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-basket-form">
      <input
        type="text"
        value={basketName}
        onChange={(e) => setBasketName(e.target.value)}
        placeholder="Enter basket name"
        required
      />
      <button type="submit" disabled={!basketName.trim()}>
        Create Basket
      </button>
    </form>
  );
};

function App() {
  const [baskets, setBaskets] = useState([]);
  const [currentView, setCurrentView] = useState("list"); // 'list' or 'basket'
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [basketRequests, setBasketRequests] = useState([]);

  useEffect(() => {
    async function fetchAllBaskets() {
      try {
        const response = await axios.get("/api/basket");
        setBaskets(response.data);
      } catch (error) {
        console.error("Could not retrieve baskets.");
      }
    }

    fetchAllBaskets();
  }, []);

  const handleBasketCreated = (newBasket) => {
    setBaskets((prevBaskets) => [...prevBaskets, newBasket]);
  };

  const handleBasketClick = async (basketName) => {
    try {
      const response = await axios.get(`/api/basket/${basketName}`);
      setSelectedBasket(basketName);
      setBasketRequests(response.data);
      setCurrentView("basket");
    } catch (error) {
      console.error("Error fetching basket requests:", error);
    }
  };

  const handleBackClick = () => {
    setCurrentView("list");
    setSelectedBasket(null);
    setBasketRequests([]);
  };

  const handleDeleteBasket = async (basketName) => {
    try {
      await axios.delete(`/api/basket/${basketName}`);
      setBaskets((prevBaskets) =>
        prevBaskets.filter((basket) => basket.path_name !== basketName)
      );
      setCurrentView("list");
      setSelectedBasket(null);
      setBasketRequests([]);
    } catch (error) {
      console.error("Error deleting basket:", error);
      alert("Failed to delete basket");
    }
  };

  const handleDeleteRequests = async (basketName) => {
    try {
      await axios.delete(`/api/basket/${basketName}/requests`);
      setBasketRequests([]);
    } catch (error) {
      console.error("Error deleting requests:", error);
      alert("Failed to delete requests");
    }
  };

  const handleRefreshRequests = (newRequests) => {
    setBasketRequests(newRequests);
  };

  return (
    <div>
      <h1>Request Bin</h1>
      <div className="app-container">
        {currentView === "list" ? (
          <>
            <CreateBasket onBasketCreated={handleBasketCreated} />
            <BasketList baskets={baskets} onBasketClick={handleBasketClick} />
          </>
        ) : (
          <BasketView
            basketName={selectedBasket}
            requests={basketRequests}
            onBackClick={handleBackClick}
            lifetimeRequests={
              baskets.find((b) => b.path_name === selectedBasket)
                ?.total_request || 0
            }
            onDeleteBasket={handleDeleteBasket}
            onDeleteRequests={handleDeleteRequests}
            onRefreshRequests={handleRefreshRequests}
          />
        )}
      </div>
    </div>
  );
}

export default App;
