import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Tag,
  Avatar,
  Input,
  Select,
  Modal,
  Form,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';


const { Search } = Input;
const { Option } = Select;

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_ALL_USERS);
      const usersData = response.data.results || response.data || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
      // Set dummy data for development
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@rimatours.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
          date_joined: '2024-01-01',
        },
        {
          id: 2,
          username: 'john_doe',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'customer',
          is_active: true,
          date_joined: '2024-01-15',
        },
        {
          id: 3,
          username: 'jane_smith',
          email: 'jane@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'customer',
          is_active: false,
          date_joined: '2024-01-20',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      await apiClient.put(endpoints.UPDATE_USER(editingUser.id), values);
      message.success('User updated successfully');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.DELETE_ACCOUNT(id));
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar, record) => (
        <Avatar
          size={50}
          src={avatar}
          icon={<UserOutlined />}
          style={{ backgroundColor: record.role === 'admin' ? '#1890ff' : '#52c41a' }}
        />
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.first_name || ''} ${record.last_name || ''}`.trim() || 'N/A',
      sorter: (a, b) => {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Customer', value: 'customer' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Joined',
      dataIndex: 'date_joined',
      key: 'date_joined',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date_joined) - new Date(b.date_joined),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {record.role !== 'admin' && (
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Are you sure you want to delete this user?',
                  content: 'This action cannot be undone.',
                  onOk: () => handleDelete(record.id),
                });
              }}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Users Management</h2>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Search users..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Filter by role"
            style={{ width: 150 }}
            value={filterRole}
            onChange={setFilterRole}
          >
            <Option value="all">All Roles</Option>
            <Option value="admin">Admin</Option>
            <Option value="customer">Customer</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="first_name"
              label="First Name"
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
          </div>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="customer">Customer</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update User
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersList;