import React, { useState } from "react";
import { Layout, Menu, Button, Drawer, Avatar, Dropdown, Space } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  CompassOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";
import LoginModal from "./Auth/LoginModal"
import RegisterModal from "./Auth/RegisterModal";
import "./Navbar.css";

const { Header } = Layout;

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useUser();

  const menuItems = [
    { key: "/", label: "Home", icon: <HomeOutlined /> },
    { key: "/tours", label: "Tours", icon: <CompassOutlined /> },
    { key: "/about", label: "About", icon: <InfoCircleOutlined /> },
    { key: "/contact", label: "Contact", icon: <PhoneOutlined /> },
    ...(isAuthenticated
      ? [{ key: "/my-bookings", label: "My Bookings", icon: <UserOutlined /> }]
      : []),
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => navigate("/profile")}
      >
        Profile
      </Menu.Item>
      {user?.role === "admin" && (
        <Menu.Item
          key="admin"
          icon={<UserOutlined />}
          onClick={() => navigate("/admin/dashboard")}
        >
          Admin Dashboard
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        danger
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Header className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div onClick={() => navigate("/")} className="navbar-logo">

            <div className="logo-text">
              <h2>Rima Tours</h2>
              <p className="tagline">India ke rang "Rima" ke sang</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="navbar-menu desktop-menu"
            disabledOverflow
          />

          {/* Actions (Auth / User) */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <div className="user-menu">
                <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight" >
                  <Space style={{ cursor: "pointer" }}>
                    <Avatar icon={<UserOutlined />} src={user?.avatar} />
                    <span className="user-name">{user?.username || "User"}</span>
                  </Space>
                </Dropdown>
              </div>
            ) : (
              <div className="auth-buttons desktop-auth">
                <Button
                  ghost
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={() => setLoginModalOpen(true)}
                  className="login-btn"
                >
                  Login
                </Button>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setRegisterModalOpen(true)}
                  className="register-btn"
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <MenuOutlined
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: "none" }}
          />
          {!isAuthenticated && (
            <div className="mobile-auth-buttons">
              <div className="mb-2">
                <Button
                  block
                  type="default"
                  icon={<LoginOutlined />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                >
                  Login
                </Button>
              </div>
              <div>
                <Button
                  block
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setRegisterModalOpen(true);
                  }}
                >
                  Register
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      </Header>

      {/* Modals */}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onRegisterClick={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onLoginClick={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </>
  );
};

export default Navbar;
