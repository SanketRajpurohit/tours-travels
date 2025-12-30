import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { apiClient } from "../../services/api";
import API from "../../api/endpoints";

const PricingForm = ({ visible, onClose, onSaved, initialValues = null }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (initialValues && initialValues.id) {
        await apiClient.put(`${API.PRICINGS.DETAIL(initialValues.id)}`, values);
      } else {
        await apiClient.post(API.PRICINGS.LIST, values);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      title={initialValues ? "Edit Pricing" : "Create Pricing"}
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || { status: "active" }}
      >
        <Form.Item name="tour" label="Tour ID" rules={[{ required: true }]}>
          <Input placeholder="Tour ID (numeric)" />
        </Form.Item>
        <Form.Item
          name="per_person"
          label="Per Person"
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item name="per_child" label="Per Child">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="per_infant" label="Per Infant">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PricingForm;
