import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BasketList = ({ baskets }) => {
  const navigate = useNavigate();
  
  return (
    <ul className="basket-list">
      {baskets.map((basket) => (
        <li key={basket.id}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(`/web/${basket.path_name}`);
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
  onRefreshBaskets,
}) => {
  useEffect(() => {
    const pollData = async () => {
      try {
        // Fetch both requests and updated baskets data
        const [requestsResponse, basketsResponse] = await Promise.all([
          axios.get(`/api/basket/${basketName}`),
          axios.get('/api/basket')
        ]);
        
        onRefreshRequests(requestsResponse.data);
        onRefreshBaskets(basketsResponse.data);
      } catch (error) {
        console.error('Error polling data:', error);
      }
    };

    const interval = setInterval(pollData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [basketName, onRefreshRequests, onRefreshBaskets]);

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
              {request.body && (
                <div>
                  <strong>Body:</strong>
                  <pre>{request.body}</pre>
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

const BasketViewWrapper = ({ 
  baskets, 
  basketRequests, 
  setBasketRequests, 
  setBaskets,
  handleDeleteBasket,
  handleDeleteRequests,
  handleRefreshRequests,
  handleRefreshBaskets
}) => {
  const { basketName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBasketData() {
      try {
        const response = await axios.get(`/api/basket/${basketName}`);
        setBasketRequests(response.data);
      } catch (error) {
        console.error("Error fetching basket requests:", error);
      }
    }

    if (basketName) {
      fetchBasketData();
    }
  }, [basketName, setBasketRequests]);

  const handleBackClick = () => {
    navigate('/web');
  };

  const onDeleteBasket = async (basketName) => {
    try {
      console.log(basketName);
      await handleDeleteBasket(basketName);
      navigate('/web');
    } catch (error) {
      console.error("Error deleting basket:", error);
      alert("Failed to delete basket");
    }
  };

  return (
    <BasketView
      basketName={basketName}
      requests={basketRequests}
      onBackClick={handleBackClick}
      lifetimeRequests={
        baskets.find((b) => b.path_name === basketName)
          ?.total_request || 0
      }
      onDeleteBasket={onDeleteBasket}
      onDeleteRequests={handleDeleteRequests}
      onRefreshRequests={handleRefreshRequests}
      onRefreshBaskets={handleRefreshBaskets}
    />
  );
};

function App() {
  const [baskets, setBaskets] = useState([]);
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

  const handleDeleteBasket = async (basketName) => {
    await axios.delete(`/api/basket/${basketName}`);
    setBaskets((prevBaskets) =>
      prevBaskets.filter((basket) => basket.path_name !== basketName)
    );
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

  const handleRefreshBaskets = (updatedBaskets) => {
    setBaskets(updatedBaskets);
  };

  return (
    <div>
      <h1>Request Bin</h1>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/web" replace />} />
          <Route path="/web" element={
            <>
              <CreateBasket onBasketCreated={handleBasketCreated} />
              <BasketList baskets={baskets} />
            </>
          } />
          <Route path="/web/:basketName" element={
            <BasketViewWrapper 
              baskets={baskets}
              basketRequests={basketRequests}
              setBasketRequests={setBasketRequests}
              setBaskets={setBaskets}
              handleDeleteBasket={handleDeleteBasket}
              handleDeleteRequests={handleDeleteRequests}
              handleRefreshRequests={handleRefreshRequests}
              handleRefreshBaskets={handleRefreshBaskets}
            />
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
