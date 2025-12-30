import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  InputNumber,
  Upload,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { endpoints } from '../../constant/ENDPOINTS';


const { TextArea } = Input;
const { Option } = Select;

const TourForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    fetchDestinations();
    if (isEdit) {
      fetchTour();
    }
  }, [id]);

  const fetchDestinations = async () => {
    try {
      const response = await apiClient.get(endpoints.GET_DESTINATIONS);
      const destinationsData = response.data.results || response.data || [];
      setDestinations(destinationsData);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      // Set dummy destinations
      setDestinations([
        { id: 1, name: 'Sikkim' },
        { id: 2, name: 'Vietnam' },
        { id: 3, name: 'Goa' },
        { id: 4, name: 'Rajasthan' },
      ]);
    }
  };

  const fetchTour = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endpoints.GET_TOUR_DETAIL(id));
      const tour = response.data;
      form.setFieldsValue({
        title: tour.title,
        description: tour.description,
        duration_days: tour.duration_days,
        max_people: tour.max_people,
        destination: tour.destination?.id,
        type: tour.type,
      });
    } catch (error) {
      console.error('Error fetching tour:', error);
      message.error('Failed to load tour details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'image' && values[key]?.fileList?.length > 0) {
            formData.append('image', values[key].fileList[0].originFileObj);
          } else if (key !== 'image') {
            formData.append(key, values[key]);
          }
        }
      });

      if (isEdit) {
        await apiClient.put(endpoints.GET_TOUR_DETAIL(id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Tour updated successfully');
      } else {
        await apiClient.post(endpoints.GET_ALL_TOURS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        message.success('Tour created successfully');
      }

      navigate('/admin/tours');
    } catch (error) {
      console.error('Error saving tour:', error);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} tour`);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/tours')}
          >
            Back to Tours
          </Button>
          <h2 style={{ margin: 0 }}>
            {isEdit ? 'Edit Tour' : 'Create New Tour'}
          </h2>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            duration_days: 5,
            max_people: 10,
            type: 'Domestic',
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="Tour Title"
                rules={[
                  { required: true, message: 'Please enter tour title' },
                  { min: 3, message: 'Title must be at least 3 characters' },
                ]}
              >
                <Input placeholder="Enter tour title" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="Tour Type"
                rules={[{ required: true, message: 'Please select tour type' }]}
              >
                <Select placeholder="Select tour type">
                  <Option value="Adventure">Adventure</Option>
                  <Option value="International">International</Option>
                  <Option value="Domestic">Domestic</Option>
                  <Option value="Beach">Beach</Option>
                  <Option value="Heritage">Heritage</Option>
                  <Option value="Honeymoon">Honeymoon</Option>
                  <Option value="Family">Family</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: 'Please enter tour description' },
              { min: 10, message: 'Description must be at least 10 characters' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter detailed tour description"
            />
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="duration_days"
                label="Duration (Days)"
                rules={[
                  { required: true, message: 'Please enter duration' },
                  { type: 'number', min: 1, message: 'Duration must be at least 1 day' },
                ]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                  placeholder="Enter duration in days"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="max_people"
                label="Maximum People"
                rules={[
                  { required: true, message: 'Please enter maximum people' },
                  { type: 'number', min: 1, message: 'Must be at least 1 person' },
                ]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="Enter max people"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="destination"
                label="Destination"
                rules={[{ required: true, message: 'Please select destination' }]}
              >
                <Select placeholder="Select destination">
                  {destinations.map(dest => (
                    <Option key={dest.id} value={dest.id}>
                      {dest.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="image"
            label="Tour Image"
            valuePropName="file"
          >
            <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={() => false} // Prevent auto upload
            >
              {uploadButton}
            </Upload>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {isEdit ? 'Update Tour' : 'Create Tour'}
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/admin/tours')}
              >
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TourForm;