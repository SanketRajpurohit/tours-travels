import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Tabs,
  message,
  Divider,
  Space,
  Spin,
} from "antd";
import { UserOutlined, LockOutlined, LogoutOutlined } from "@ant-design/icons";
import Navbar from "./Navbar";
import Footer from "./Footer";
import InquiryButton from "./InquiryButton";
import { useUser } from "../../context/userContext";
import "./Profile.css";

const Profile = () => {
  const { user, updateProfile, logout } = useUser();
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    if (user) {
      editForm.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      });
      setUserLoading(false);
    }
  }, [user, editForm]);

  const onFinishEditProfile = async (values) => {
    setEditLoading(true);
    try {
      await updateProfile(values);
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error("Failed to update profile. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const onFinishChangePassword = async (values) => {
    setPasswordLoading(true);
    try {
      // TODO: Call API to change password
      // await apiClient.post(endpoints.CHANGE_PASSWORD, {
      //   currentPassword: values.currentPassword,
      //   newPassword: values.newPassword,
      // });
      message.success("Password changed successfully!");
      passwordForm.resetFields();
    } catch (error) {
      message.error("Failed to change password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    message.success("You have been logged out successfully!");
  };

  const tabs = [
    {
      key: "profile",
      label: (
        <span>
          <UserOutlined /> Profile Information
        </span>
      ),
      children: (
        <Card className="profile-tab-card">
          <h2>Edit Your Profile</h2>
          <Form
            form={editForm}
            onFinish={onFinishEditProfile}
            layout="vertical"
            autoComplete="off"
            size="large"
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="firstName"
                  rules={[
                    { required: true, message: "Please enter first name" },
                  ]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lastName"
                  rules={[
                    { required: true, message: "Please enter last name" },
                  ]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email" },
              ]}
            >
              <Input placeholder="Email Address" type="email" disabled />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Please enter phone number" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              ]}
            >
              <Input placeholder="Phone Number" maxLength={10} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={editLoading}
                size="large"
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: "password",
      label: (
        <span>
          <LockOutlined /> Change Password
        </span>
      ),
      children: (
        <Card className="profile-tab-card">
          <h2>Change Your Password</h2>
          <Form
            form={passwordForm}
            onFinish={onFinishChangePassword}
            layout="vertical"
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="currentPassword"
              rules={[
                { required: true, message: "Please enter current password" },
              ]}
            >
              <Input.Password
                placeholder="Current Password"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: "Please enter new password" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters",
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Password must contain uppercase, lowercase, and numbers",
                },
              ]}
            >
              <Input.Password
                placeholder="New Password"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm New Password"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={passwordLoading}
                size="large"
              >
                Change Password
              </Button>
            </Form.Item>

            <div className="password-note">
              <strong>Password Requirements:</strong>
              <ul>
                <li>At least 8 characters long</li>
                <li>Contains uppercase letters (A-Z)</li>
                <li>Contains lowercase letters (a-z)</li>
                <li>Contains numbers (0-9)</li>
              </ul>
            </div>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {/* Header */}
        <section className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account settings and preferences</p>
        </section>

        {userLoading ? (
          <div className="profile-loading">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[32, 32]}>
              {/* User Info Card */}
              <Col xs={24} lg={8}>
                <Card className="user-info-card">
                  <div className="user-avatar">
                    <UserOutlined />
                  </div>
                  <h3>
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="user-email">{user?.email}</p>
                  <Divider />
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{user?.phone || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">User Type:</span>
                      <span className="value">
                        {user?.userType || "Customer"}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Member Since:</span>
                      <span className="value">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </Space>
                  <Button
                    type="primary"
                    danger
                    block
                    size="large"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{ marginTop: "2rem" }}
                  >
                    Logout
                  </Button>
                </Card>
              </Col>

              {/* Profile Form */}
              <Col xs={24} lg={16}>
                <Tabs items={tabs} />
              </Col>
            </Row>
          </>
        )}
      </div>

      <InquiryButton />
      <Footer />
    </div>
  );
};

export default Profile;
