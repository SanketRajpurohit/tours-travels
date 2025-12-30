import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  InputNumber,
  DatePicker,
  message,
  Steps,
  Divider,
  Table,
  Modal,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Navbar from "./Navbar";
import Footer from "./Footer";
import InquiryButton from "./InquiryButton";
import { useUser } from "../../context/userContext";
import { useParams } from "react-router-dom";
import "./Booking.css";

import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

const Booking = () => {
  const { tourId } = useParams();
  const { user } = useUser();
  const [bookingForm] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tourData, setTourData] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  useEffect(() => {
    if (tourData) {
      setTotalPrice(tourData.price * numberOfPassengers);
    }
  }, [numberOfPassengers, tourData]);

  const fetchTourData = async () => {
    try {
      const res = await apiClient.get(endpoints.GET_TOUR_DETAIL(tourId));
      const t = res.data;
      const mockTour = {
        id: t.id,
        name: t.title,
        price: (t.pricings && t.pricings[0]?.adult_price) || 0,
        duration: `${t.duration_days} Days`,
        destination: t.destination,
        image: t.image || "https://via.placeholder.com/400x300",
      };
      setTourData(mockTour);
    } catch (error) {
      message.error("Failed to fetch tour details");
    }
  };

  const handleNumberOfPassengersChange = (value) => {
    setNumberOfPassengers(value || 1);
    setPassengers(
      Array(value || 1)
        .fill(null)
        .map((_, i) => passengers[i] || {})
    );
  };

  const onFinishBooking = async (values) => {
    if (currentStep === 0) {
      // Validate at least one passenger
      if (numberOfPassengers < 1) {
        message.error("Please select at least 1 passenger");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Final submission
      setLoading(true);
      try {
        const bookingData = {
          tour: tourId,
          travelers_count: numberOfPassengers,
          total_price: totalPrice,
        };
        await apiClient.post(endpoints.CREATE_BOOKING, bookingData);
        message.success("Booking confirmed! Redirecting to payment...");
        // TODO: Redirect to payment page
      } catch (error) {
        message.error("Failed to create booking");
      } finally {
        setLoading(false);
      }
    }
  };

  const passengerColumns = [
    {
      title: "Passenger #",
      dataIndex: "number",
      key: "number",
      width: 100,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, __, index) => (
        <Input
          placeholder="Full Name"
          value={passengers[index]?.name || ""}
          onChange={(e) => {
            const newPassengers = [...passengers];
            newPassengers[index] = {
              ...newPassengers[index],
              name: e.target.value,
            };
            setPassengers(newPassengers);
          }}
        />
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 80,
      render: (_, __, index) => (
        <InputNumber
          placeholder="Age"
          min={1}
          max={120}
          value={passengers[index]?.age || null}
          onChange={(value) => {
            const newPassengers = [...passengers];
            newPassengers[index] = { ...newPassengers[index], age: value };
            setPassengers(newPassengers);
          }}
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  const steps = [
    {
      title: "Tour Details",
      description: "Select number of passengers",
    },
    {
      title: "Passenger Info",
      description: "Enter passenger details",
    },
    {
      title: "Confirm & Pay",
      description: "Review and complete booking",
    },
  ];

  return (
    <div className="booking-page">
      <Navbar />

      <div className="booking-container">
        {/* Header */}
        <section className="booking-header">
          <h1>Complete Your Booking</h1>
          <p>Reserve your dream tour today!</p>
        </section>

        <Row gutter={[32, 32]}>
          {/* Steps */}
          <Col xs={24}>
            <Card className="steps-card">
              <Steps current={currentStep} items={steps} />
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="booking-form-card">
              {currentStep === 0 && (
                <div className="booking-step">
                  <h2>Select Number of Passengers</h2>
                  <Form
                    layout="vertical"
                    autoComplete="off"
                    size="large"
                    onFinish={onFinishBooking}
                  >
                    <Form.Item
                      label="Number of Travelers"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={1}
                        max={20}
                        value={numberOfPassengers}
                        onChange={handleNumberOfPassengersChange}
                        style={{ width: "100%" }}
                        placeholder="Select number of travelers"
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      block
                      size="large"
                      onClick={() => onFinishBooking({})}
                    >
                      Next: Enter Passenger Details
                    </Button>
                  </Form>
                </div>
              )}

              {currentStep === 1 && (
                <div className="booking-step">
                  <h2>Passenger Details</h2>
                  <p className="step-description">
                    Please enter details for all {numberOfPassengers}{" "}
                    passenger(s)
                  </p>
                  <Table
                    columns={passengerColumns}
                    dataSource={passengers}
                    rowKey={(_, index) => index}
                    pagination={false}
                    className="passenger-table"
                  />
                  <div className="step-buttons">
                    <Button onClick={() => setCurrentStep(0)}>Back</Button>
                    <Button type="primary" onClick={() => onFinishBooking({})}>
                      Review Booking
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="booking-step">
                  <h2>Review & Confirm</h2>
                  <div className="booking-summary">
                    <h3>Tour Summary</h3>
                    <div className="summary-row">
                      <span>Tour Name:</span>
                      <span className="value">{tourData?.name}</span>
                    </div>
                    <div className="summary-row">
                      <span>Duration:</span>
                      <span className="value">{tourData?.duration}</span>
                    </div>
                    <div className="summary-row">
                      <span>Price per Person:</span>
                      <span className="value">
                        ₹{tourData?.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Number of Passengers:</span>
                      <span className="value">{numberOfPassengers}</span>
                    </div>
                    <Divider />
                    <h3>Passenger Details</h3>
                    {passengers.map((p, idx) => (
                      <div key={idx} className="passenger-summary">
                        <p>
                          <strong>Passenger {idx + 1}:</strong>{" "}
                          {p.name || "N/A"} ({p.age || "N/A"} years)
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="step-buttons">
                    <Button onClick={() => setCurrentStep(1)}>Back</Button>
                    <Button
                      type="primary"
                      loading={loading}
                      onClick={() => onFinishBooking({})}
                      size="large"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Price Summary */}
          <Col xs={24} lg={8}>
            <Card className="price-summary-card">
              <h3>Price Summary</h3>
              <div className="price-item">
                <span>Base Price (1 person):</span>
                <span className="price">
                  ₹{tourData?.price?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="price-item">
                <span>Number of Travelers:</span>
                <span className="quantity">{numberOfPassengers}</span>
              </div>
              <Divider />
              <div className="price-item total">
                <span>Total Amount:</span>
                <span className="total-price">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="price-note">
                📝 Cancellation allowed up to 14 days before the tour.
                <br />
                100% refund on cancellation.
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <InquiryButton />
      <Footer />
    </div>
  );
};

export default Booking;
