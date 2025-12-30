import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  message,
} from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../services/api";
import { endpoints } from "../../../constant/ENDPOINTS";



const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPayments: 0,
    completedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch bookings for stats
      const bookingsRes = await apiClient.get(endpoints.GET_BOOKINGS);
      const bookings = bookingsRes.data || [];

      // Fetch users for stats
      const usersRes = await apiClient.get(endpoints.GET_ALL_USERS);
      const users = usersRes.data || [];

      // Fetch payments
      const paymentsRes = await apiClient.get(endpoints.GET_PAYMENTS);
      const payments = paymentsRes.data || [];

      const completedCount = bookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const totalPaymentAmount = payments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );

      setStats({
        totalUsers: users.length,
        totalBookings: bookings.length,
        totalPayments: totalPaymentAmount,
        completedBookings: completedCount,
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (err) {
      message.error("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bookingColumns = [
    { title: "Booking ID", dataIndex: "id", key: "id" },
    { title: "Customer", dataIndex: ["user", "username"], key: "user" },
    { title: "Tour", dataIndex: ["tour", "title"], key: "tour" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          confirmed: "green",
          pending: "orange",
          cancelled: "red",
        };
        return <Tag color={colors[status] || "blue"}>{status}</Tag>;
      },
    },
    { title: "Total", dataIndex: "total_price", key: "total_price" },
  ];

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Total Bookings"
              value={stats.totalBookings}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Revenue"
              value={stats.totalPayments}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Completed"
              value={stats.completedBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="Quick Actions">
            <Space wrap>
              <Button type="primary" onClick={() => navigate('/admin/bookings')}>
                View Bookings
              </Button>
              <Button onClick={() => navigate('/admin/users')}>Manage Users</Button>
              <Button onClick={() => navigate('/admin/tours')}>Manage Tours</Button>
              <Button onClick={() => navigate('/admin/payments')}>View Payments</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Bookings Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Recent Bookings" loading={loading}>
            <Table
              columns={bookingColumns}
              dataSource={recentBookings}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
