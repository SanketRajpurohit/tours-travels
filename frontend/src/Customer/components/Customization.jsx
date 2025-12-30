import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  message,
  Steps,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { apiClient } from '../../services/api';

import './Customization.css';
import { endpoints } from '../../constant/ENDPOINTS';

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const Customization = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // TODO: Implement custom package API call
      await apiClient.post(endpoints.CREATE_CUSTOM_PACKAGE, values);
      message.success('Your custom tour request has been submitted! We will contact you soon.');
      form.resetFields();
      setCurrentStep(0);
    } catch (error) {
      console.error('Error submitting custom package:', error);
      message.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Personal Details',
      icon: <UserOutlined />,
    },
    {
      title: 'Travel Preferences',
      icon: <EnvironmentOutlined />,
    },
    {
      title: 'Trip Details',
      icon: <CalendarOutlined />,
    },
    {
      title: 'Confirmation',
      icon: <CheckCircleOutlined />,
    },
  ];

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      message.error('Please fill in all required fields');
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter your first name' }]}
              >
                <Input placeholder="Enter your first name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter your last name' }]}
              >
                <Input placeholder="Enter your last name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter your phone number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
                ]}
              >
                <Input placeholder="Enter your phone number" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
        );

      case 1:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="destination"
                label="Preferred Destination"
                rules={[{ required: true, message: 'Please select a destination' }]}
              >
                <Select placeholder="Select destination">
                  <Option value="sikkim">Sikkim</Option>
                  <Option value="vietnam">Vietnam</Option>
                  <Option value="goa">Goa</Option>
                  <Option value="rajasthan">Rajasthan</Option>
                  <Option value="kerala">Kerala</Option>
                  <Option value="himachal">Himachal Pradesh</Option>
                  <Option value="other">Other (specify in notes)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="tourType"
                label="Tour Type"
                rules={[{ required: true, message: 'Please select tour type' }]}
              >
                <Select placeholder="Select tour type">
                  <Option value="adventure">Adventure</Option>
                  <Option value="family">Family</Option>
                  <Option value="honeymoon">Honeymoon</Option>
                  <Option value="business">Business</Option>
                  <Option value="pilgrimage">Pilgrimage</Option>
                  <Option value="beach">Beach</Option>
                  <Option value="heritage">Heritage</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="accommodation"
                label="Accommodation Preference"
                rules={[{ required: true, message: 'Please select accommodation' }]}
              >
                <Select placeholder="Select accommodation">
                  <Option value="3-star">3 Star Hotel</Option>
                  <Option value="4-star">4 Star Hotel</Option>
                  <Option value="5-star">5 Star Hotel</Option>
                  <Option value="resort">Resort</Option>
                  <Option value="homestay">Homestay</Option>
                  <Option value="budget">Budget Hotel</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="transportation"
                label="Transportation"
                rules={[{ required: true, message: 'Please select transportation' }]}
              >
                <Select placeholder="Select transportation">
                  <Option value="flight">Flight</Option>
                  <Option value="train">Train</Option>
                  <Option value="bus">Bus</Option>
                  <Option value="car">Private Car</Option>
                  <Option value="mixed">Mixed (Flight + Car)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        );

      case 2:
        return (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startDate"
                label="Preferred Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="Select start date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="duration"
                label="Duration (Days)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  style={{ width: '100%' }}
                  placeholder="Enter number of days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="numberOfPeople"
                label="Number of People"
                rules={[{ required: true, message: 'Please enter number of people' }]}
              >
                <InputNumber
                  min={1}
                  max={50}
                  style={{ width: '100%' }}
                  placeholder="Enter number of people"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="budget"
                label="Budget Range (₹)"
                rules={[{ required: true, message: 'Please select budget range' }]}
              >
                <Select placeholder="Select budget range">
                  <Option value="under-25000">Under ₹25,000</Option>
                  <Option value="25000-50000">₹25,000 - ₹50,000</Option>
                  <Option value="50000-100000">₹50,000 - ₹1,00,000</Option>
                  <Option value="100000-200000">₹1,00,000 - ₹2,00,000</Option>
                  <Option value="above-200000">Above ₹2,00,000</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="specialRequests"
                label="Special Requests / Notes"
              >
                <TextArea
                  rows={4}
                  placeholder="Any special requirements, dietary restrictions, accessibility needs, or additional information..."
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case 3:
        return (
          <div className="confirmation-step">
            <div className="confirmation-icon">
              <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
            </div>
            <h3>Review Your Request</h3>
            <p>Please review your custom tour request details below:</p>

            <Card className="review-card">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <strong>Contact:</strong> {form.getFieldValue('firstName')} {form.getFieldValue('lastName')}
                  <br />
                  <strong>Email:</strong> {form.getFieldValue('email')}
                  <br />
                  <strong>Phone:</strong> {form.getFieldValue('phone')}
                </Col>
                <Col xs={24} sm={12}>
                  <strong>Destination:</strong> {form.getFieldValue('destination')}
                  <br />
                  <strong>Tour Type:</strong> {form.getFieldValue('tourType')}
                  <br />
                  <strong>Duration:</strong> {form.getFieldValue('duration')} days
                </Col>
                <Col xs={24} sm={12}>
                  <strong>People:</strong> {form.getFieldValue('numberOfPeople')}
                  <br />
                  <strong>Budget:</strong> {form.getFieldValue('budget')}
                  <br />
                  <strong>Accommodation:</strong> {form.getFieldValue('accommodation')}
                </Col>
                <Col xs={24} sm={12}>
                  <strong>Transportation:</strong> {form.getFieldValue('transportation')}
                  <br />
                  <strong>Start Date:</strong> {form.getFieldValue('startDate')?.format('DD/MM/YYYY')}
                </Col>
              </Row>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="customization-page">
      <div className="customization-container">
        <motion.div
          className="customization-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Customize Your Dream Tour</h1>
          <p>Tell us your preferences and we'll create the perfect tour package for you</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="customization-card">
            <Steps current={currentStep} className="customization-steps">
              {steps.map((step, index) => (
                <Step key={index} title={step.title} icon={step.icon} />
              ))}
            </Steps>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="customization-form"
            >
              <div className="step-content">
                {renderStepContent()}
              </div>

              <div className="step-actions">
                {currentStep > 0 && (
                  <Button onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button type="primary" onClick={nextStep}>
                    Next
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Submit Request
                  </Button>
                )}
              </div>
            </Form>
          </Card>
        </motion.div>

        <motion.div
          className="customization-info"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className="info-card">
                <h4>📞 Quick Response</h4>
                <p>We'll contact you within 24 hours with a customized quote</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="info-card">
                <h4>💰 Best Prices</h4>
                <p>Get competitive pricing with no hidden charges</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="info-card">
                <h4>✨ Personalized</h4>
                <p>Every detail tailored to your preferences and budget</p>
              </Card>
            </Col>
          </Row>
        </motion.div>
      </div>
    </div>
  );
};

export default Customization;