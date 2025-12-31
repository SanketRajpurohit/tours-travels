import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  DatePicker,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';

const { Option } = Select;

const SeasonsList = () => {
  const [seasons, setSeasons] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSeasons();
    fetchTours();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_SEASONS);
      const seasonsData = response.data?.data || response.data?.results || [];
      setSeasons(Array.isArray(seasonsData) ? seasonsData : []);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      message.error('Failed to load seasons');
      // Set dummy data
      setSeasons([
        {
          id: 1,
          tour: { id: 1, title: 'Sikkim Adventure' },
          name: 'Monsoon Sale',
          month: 'July - September',
          description: 'Best time to visit with lush greenery',
        },
        {
          id: 2,
          tour: { id: 1, title: 'Sikkim Adventure' },
          name: 'Diwali Holiday',
          month: 'October - January',
          description: 'Perfect weather for mountain tours',
        },
        {
          id: 3,
          tour: { id: 2, title: 'Vietnam Discovery' },
          name: 'Winter Season',
          month: 'December - February',
          description: 'Cool and pleasant weather',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_ALL_TOURS);
      const toursData = response.data?.data || response.data?.results || [];
      setTours(Array.isArray(toursData) ? toursData : []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([
        { id: 1, title: 'Sikkim Adventure' },
        { id: 2, title: 'Vietnam Discovery' },
      ]);
    }
  };

  const handleAdd = () => {
    setEditingSeason(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (season) => {
    setEditingSeason(season);
    form.setFieldsValue({
      tour: season.tour?.id,
      name: season.name,
    start_month: dayjs().month(season.start_month - 1),
    end_month: dayjs().month(season.end_month - 1),
      description: season.description,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
  const payload = {
    ...values,
    start_month: values.start_month.month() + 1, // 0–11 → 1–12
    end_month: values.end_month.month() + 1,
  };

  try {
    if (editingSeason) {
      await apiClient.put(
        endpoints.GET_SEASON_DETAIL(editingSeason.id),
        payload
      );
      message.success("Season updated successfully");
    } else {
      await apiClient.post(endpoints.GET_SEASONS, payload);
      message.success("Season created successfully");
    }
    setModalVisible(false);
    fetchSeasons();
  } catch (error) {
    console.error("Error saving season:", error);
    message.error("Failed to save season");
  }
};

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(endpoints.GET_SEASON_DETAIL(id));
      message.success('Season deleted successfully');
      fetchSeasons();
    } catch (error) {
      console.error('Error deleting season:', error);
      message.error('Failed to delete season');
    }
  };

  const columns = [
    {
      title: 'Tour',
      key: 'tour',
      render: (_, record) => record.tour?.title || 'N/A',
      filters: Array.isArray(tours) ? tours.map(tour => ({ text: tour.title, value: tour.id })) : [],
      onFilter: (value, record) => record.tour?.id === value,
    },
    {
      title: 'Season Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
          <Popconfirm
            title="Are you sure you want to delete this season?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Seasons Management</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Season
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={seasons}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} seasons`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingSeason ? 'Edit Season' : 'Add Season'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
       <Form
  form={form}
  layout="vertical"
  onFinish={handleSubmit}
>
  {/* Tour */}
  <Form.Item
    name="tour"
    label="Tour"
    rules={[{ required: true, message: "Please select a tour" }]}
  >
    <Select placeholder="Select tour">
      {Array.isArray(tours) &&
        tours.map((tour) => (
          <Select.Option key={tour.id} value={tour.id}>
            {tour.title}
          </Select.Option>
        ))}
    </Select>
  </Form.Item>

  {/* Season Name */}
  <Form.Item
    name="name"
    label="Season Name"
    rules={[{ required: true, message: "Please enter season name" }]}
  >
    <Input placeholder="Enter season name" />
  </Form.Item>

  {/* Start & End Month */}
  <Row gutter={16}>
    <Col xs={24} sm={12}>
      <Form.Item
        name="start_month"
        label="Start Month"
        rules={[{ required: true, message: "Please select start month" }]}
      >
        <DatePicker
         format="MMMM"
  style={{ width: "100%" }}
  picker="month"
  disabledDate={(current) =>
    current && current.month() < form.getFieldValue("start_month")?.month()
  }
/>
      </Form.Item>
    </Col>

    <Col xs={24} sm={12}>
      <Form.Item
        name="end_month"
        label="End Month"
        rules={[{ required: true, message: "Please select end month" }]}
      >
        <DatePicker
          picker="month"
          style={{ width: "100%" }}
          placeholder="End month"
        />
      </Form.Item>
    </Col>
  </Row>

  {/* Description */}
  <Form.Item name="description" label="Description">
    <Input.TextArea rows={3} placeholder="Enter season description" />
  </Form.Item>

  {/* Actions */}
  <Form.Item>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Button onClick={() => setModalVisible(false)}>Cancel</Button>
      <Button type="primary" htmlType="submit">
        {editingSeason ? "Update" : "Create"} Season
      </Button>
    </div>
  </Form.Item>
</Form>
      </Modal>
    </div>
  );
};

export default SeasonsList;