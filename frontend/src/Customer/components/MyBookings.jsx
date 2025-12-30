import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Button,
  Tag,
  Table,
  Modal,
  message,
  Empty,
  Spin,
  Space,
} from "antd";
import { DeleteOutlined, FilePdfFilled } from "@ant-design/icons";

import { useUser } from "../../context/userContext";

import { apiClient } from "../../services/api";
import { endpoints } from "../../constant/ENDPOINTS";

import "./MyBookings.css"
const MyBookings = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get(endpoints.GET_BOOKINGS);
      const data = res.data;
      const mapped = data.map((b) => ({
        id: b.id,
        tourName: b.tour?.title || b.tour || "Tour",
        startDate: b.created_at,
        endDate: b.created_at,
        totalAmount: b.total_price,
        status: b.status,
        passengers: b.travelers_count,
        bookingDate: b.created_at,
        tour_details: b.tour, // Added for modal display
      }));
      setBookings(mapped);
    } catch (error) {
      message.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancelLoading(true);
    try {
      // Create a cancellation record
      const payload = {
        booking: bookingId,
        reason_for_cancellation: "User requested cancellation via website",
        cancellation_date: new Date().toISOString().split("T")[0],
        refund_status: "Pending", // Assuming backend handles logic or defaults
      };

      await apiClient.post(endpoints.CANCEL_BOOKING, payload);

      // Also potentially update booking status if backend doesn't do it automatically
      // But typically cancellation creation should trigger a signal or we manually update local state

      message.success("Cancellation request submitted successfully!");
      setModalVisible(false);
      fetchBookings(); // Refresh list to show updated status
    } catch (error) {
      console.error("Cancellation failed", error);
      message.error("Failed to submit cancellation request. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDownloadInvoice = (bookingId) => {
    // TODO: Implement invoice download
    message.info("Invoice download functionality coming soon!");
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "green",
      pending: "orange",
      completed: "blue",
      cancelled: "red",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: "Confirmed",
      pending: "Pending",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#667eea" }}>{text}</span>
      ),
    },
    {
      title: "Tour Name",
      dataIndex: "tourName",
      key: "tourName",
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 150,
      render: (date, record) => (
        <span>
          {new Date(date).toLocaleDateString()} -{" "}
          {new Date(record.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Passengers",
      dataIndex: "passengers",
      key: "passengers",
      width: 100,
      render: (passengers) => <span>{passengers} Person(s)</span>,
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      render: (amount) => (
        <span style={{ fontWeight: 600 }}>₹{amount.toLocaleString()}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<FilePdfFilled />}
            onClick={() => handleDownloadInvoice(record.id)}
          >
            Invoice
          </Button>
          {record.status === "confirmed" && (
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedBooking(record);
                setModalVisible(true);
              }}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading bookings..." />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.startDate) > new Date() && b.status !== "cancelled"
  );

  const pastBookings = bookings.filter(
    (b) => new Date(b.startDate) <= new Date() || b.status === "cancelled"
  );

  return (


    <div className="mybookings-container">
      <div className="mybookings-header">
        <h1>My Bookings</h1>
        <p>View and manage all your tour bookings</p>
      </div>

      {bookings.length > 0 ? (
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: "all",
              label: `All (${bookings.length})`,
              children: (
                <Card >
                  <Table
                    columns={columns}
                    dataSource={bookings}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 800 }}
                  />
                </Card>
              )
            },
            {
              key: "upcoming",
              label: "Upcoming",
              children: (
                <Card >
                  <Table
                    columns={columns}
                    dataSource={upcomingBookings}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 800 }}
                    locale={{ emptyText: <Empty description="No upcoming bookings" /> }}
                  />
                </Card>
              )
            }
          ]}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <Empty description="You haven't booked any tours yet" />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => window.location.href = "/tours"}>
            Browse Tours
          </Button>
        </div>
      )}

      {/* Cancel Booking Modal */}
      <Modal
        title="Cancel Booking"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Keep Booking
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={cancelLoading}
            onClick={() => handleCancelBooking(selectedBooking?.id)}
          >
            Confirm Cancellation
          </Button>,
        ]}
      >
        <div className="cancel-modal-content">
          <h3>Are you sure you want to cancel this booking?</h3>
          {selectedBooking && (
            <>
              <p>
                <strong>Booking ID:</strong> {selectedBooking.id}
              </p>
              <p>
                <strong>Tour:</strong> {selectedBooking.tourName}
              </p>
              <p>
                <strong>Amount:</strong> ₹{selectedBooking.totalAmount}
              </p>
              <p className="warning">
                💡 Note: Refund will be processed according to our cancellation
                policy. Please check your email for refund details.
              </p>
            </>
          )}
        </div>
      </Modal>



    </div>
  );
}

export default MyBookings
