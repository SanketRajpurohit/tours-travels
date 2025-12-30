import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Spin, Empty, Space, Typography } from "antd";
import { FilterOutlined, SearchOutlined, CalendarOutlined, UserOutlined, ArrowRightOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { apiClient } from "../../services/api";
import "./Tours.css";
import { endpoints } from "../../constant/ENDPOINTS";

const Tours = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    priceRange: "all",
    duration: "all",
  });
  const [selectedDuration, setSelectedDuration] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(endpoints.GET_ALL_TOURS);
        const data = res.data;
        // data is list of tours; map to UI-friendly fields
        const mapped = data.map((t) => ({
          id: t.id,
          title: t.title,
          type: t.destination_details?.name || "General",
          price: (t.pricings && t.pricings[0]?.adult_price) || 0,
          duration: t.duration || t.duration_days || 1,
          image: t.image || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop&q=80`,
          description: t.description,
          rating: 4.5,
          reviews: 0,
          availability: "Available",
          groupSize: `${t.max_people || 10} People`,
        }));
        setTours(mapped);
      } catch (err) {
        console.error("Failed to fetch tours", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFilter = (filterType, value) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const filteredTours = tours.filter((tour) => {
    // Basic type filter
    if (filters.type !== "all" && tour.type.toLowerCase() !== filters.type) return false;

    // Duration filter
    if (selectedDuration !== 'All') {
      if (selectedDuration === 'Under 5 Days' && tour.duration >= 5) return false;
      if (selectedDuration === '5-10 Days' && (tour.duration < 5 || tour.duration > 10)) return false;
      if (selectedDuration === '10+ Days' && tour.duration <= 10) return false;
    }

    return true;
  });

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  if (loading) {
    return (
      <div className="tours-page">
        <div className="loading-container"><Spin size="large" tip="Loading tours..." /></div>
      </div>
    );
  }

  return (
    <div className="tours-page">
      <div className="tours-container">
        <motion.div
          className="tours-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Explore Our Tour Packages</h1>
          <p>Choose from our wide range of amazing tour destinations</p>
        </motion.div>

        <Row gutter={[32, 32]}>
          {/* Filters Sidebar */}
          <Col xs={24} lg={6}>
            <motion.div
              className="filters-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3>
                <FilterOutlined /> Filters
              </h3>

              <div className="filter-group">
                <label>Duration</label>
                <div className="filter-options">
                  {['All', 'Under 5 Days', '5-10 Days', '10+ Days'].map(opt => (
                    <button
                      key={opt}
                      className={`filter-btn ${selectedDuration === opt ? "active" : ""}`}
                      onClick={() => setSelectedDuration(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Tour Type</label>
                <div className="filter-options">
                  {["all", "domestic", "international", "couple", "family"].map(
                    (type) => (
                      <button
                        key={type}
                        className={`filter-btn ${filters.type === type ? "active" : ""}`}
                        onClick={() => handleFilter("type", type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Tours Grid */}
          <Col xs={24} lg={18}>
            {filteredTours.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <Row gutter={[24, 24]}>
                  {filteredTours.map((tour) => (
                    <Col key={tour.id} xs={24} sm={12} lg={8}>
                      <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      >
                        <Card
                          className="tour-card"
                          cover={
                            <div className="tour-image-container">
                              <img src={tour.image} alt={tour.title} />
                              <span className="tour-badge">
                                <ClockCircleOutlined /> {tour.duration}d
                              </span>
                              <div className="tour-overlay">
                                <Button
                                  type="primary"
                                  size="large"
                                  onClick={() => navigate(`/tours/${tour.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          }
                          hoverable
                          bodyStyle={{ padding: '1.2rem' }}
                        >
                          <h3>{tour.title}</h3>
                          <p className="tour-description">{tour.description?.substring(0, 100) || "Explore amazing destinations"}...</p>

                          <div className="tour-meta">
                            <span><CalendarOutlined /> {tour.availability}</span>
                            <span><UserOutlined /> {tour.groupSize}</span>
                          </div>

                          <div className="tour-footer">
                            <span className="tour-price">
                              ₹{tour.price.toLocaleString()}
                            </span>
                            <Button
                              type="link"
                              onClick={() => navigate(`/tours/${tour.id}`)}
                              icon={<ArrowRightOutlined />}
                            >
                              Details
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </motion.div>
            ) : (
              <Empty description="No tours found" />
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Tours;
