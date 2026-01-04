
import React, { useEffect, useState, useContext } from 'react';
import { 
  Steps, 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Upload, 
  Divider, 
  Tabs, 
  Collapse, 
  Row, 
  Col,
  Space,
  Tag,
  Avatar,
  Descriptions,
  Alert,
  Image
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  CheckOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { adminCreateProduct, getAllBrands, getAllCategories } from '../../../Redux/actions/ProductThunk';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../../components/NotificationProvider';

const { Step } = Steps;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;


/* -------------------------
   BasicInfoStep (Step 1)
   Remove product-level images upload
   ------------------------- */
const BasicInfoStep = ({ form, onNext, initialValues }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const notification = useContext(NotificationContext);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await dispatch(getAllCategories());
      if (response) {
        setCategories(response);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await dispatch(getAllBrands());
      if (response) {
        setBrands(response);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  // Rich text modules
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };
  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  return (
    // <Form
    //   form={form}
    //   layout="vertical"
    //   initialValues={initialValues}
    //   onFinish={(values) => onNext(values)} // do not include images here
    // >
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={(values) => {
        const category = categories.find(c => c.id === values.categoryId);
        const brand = brands.find(b => b.id === values.brandId);

        onNext({
          ...values,
          categoryName: category?.name,
          brandName: brand?.name,
        });
      }}
    >

      <Card title="Thông tin cơ bản" bordered={false}>
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
        >
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="Mô tả"
          rules={[{ required: false }]}
        >
          <ReactQuill 
            theme="snow"
            modules={modules}
            formats={formats}
            placeholder="Nhập mô tả sản phẩm. Bạn có thể sử dụng định dạng in đậm, in nghiêng..."
            style={{ height: 200, marginBottom: 50 }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select placeholder="Chọn danh mục" loading={loading}>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="brandId"
              label="Thương hiệu"
              rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
            >
              <Select placeholder="Chọn thương hiệu" loading={loading}>
                {brands.map(brand => (
                  <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button type="primary" htmlType="submit">
          Tiếp theo <ArrowRightOutlined />
        </Button>
      </div>
    </Form>
  );
};

/* -------------------------
   OptionsStep (Step 2)
   - Add images upload per option (multiple)
   - Keep previous validation behavior
   ------------------------- */
const OptionsStep = ({ form, onNext, onBack, initialValues }) => {
  const [activeTab, setActiveTab] = useState('0');
  const [options, setOptions] = useState([{}]);
  const [optionErrors, setOptionErrors] = useState({});
  const notification = useContext(NotificationContext);

  // initialize options from initialValues
  useEffect(() => {
    if (initialValues.options && initialValues.options.length > 0) {
      // ensure each option has an images array (for UI)
      const normalized = initialValues.options.map(opt => ({
        ...opt,
        images: opt.images || []
      }));
      setOptions(normalized);
      form.setFieldsValue({ options: normalized });
    }
  }, [initialValues.options, form]);

  
  const addOption = () => {
    const currentOptions = form.getFieldValue("options") || [];

    const newOptions = [
      ...currentOptions,
      { images: [] }
    ];

    setOptions(newOptions);
    form.setFieldsValue({ options: newOptions });
    setActiveTab((newOptions.length - 1).toString());
  };


  const removeOption = (index) => {
    if (options.length <= 1) {
      notification.warning({
        message: 'Cảnh báo',
        description: 'Cần có ít nhất một phiên bản',
        placement: 'topRight',
      });
      return;
    }

    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    form.setFieldsValue({ options: newOptions });

    setActiveTab(Math.max(0, index - 1).toString());

    const newErrors = { ...optionErrors };
    delete newErrors[index];

    // reindex errors
    const updatedErrors = {};
    Object.keys(newErrors).forEach(errIndex => {
      const errIndexNum = parseInt(errIndex);
      if (errIndexNum > index) {
        updatedErrors[errIndexNum - 1] = newErrors[errIndexNum];
      } else {
        updatedErrors[errIndexNum] = newErrors[errIndexNum];
      }
    });
    setOptionErrors(updatedErrors);
  };

  // Validate duplicate option code
  const validateOptionCodes = (values) => {
    const optionValues = values.options || [];
    const codes = optionValues.map(option => option.code?.trim()).filter(Boolean);
    const uniqueCodes = new Set(codes);
    if (uniqueCodes.size !== codes.length) {
      const duplicateCodes = codes.filter((code, idx) => codes.indexOf(code) !== idx);
      const errorIndexes = [];
      optionValues.forEach((option, index) => {
        if (option.code && duplicateCodes.includes(option.code.trim())) {
          errorIndexes.push(index);
        }
      });
      const newErrors = {};
      errorIndexes.forEach(i => {
        newErrors[i] = `Mã phiên bản "${optionValues[i].code}" bị trùng lặp.`;
      });
      setOptionErrors(newErrors);
      notification.error({
        message: 'Lỗi',
        description: `Mã phiên bản "${duplicateCodes[0]}" bị trùng lặp. Mỗi phiên bản phải có mã khác nhau.`,
        placement: 'topRight',
      });
      if (errorIndexes.length > 0) setActiveTab(errorIndexes[0].toString());
      return false;
    }
    setOptionErrors({});
    return true;
  };

  const handleSubmit = () => {
    // Validate ant form fields first
    form.validateFields().then(values => {
      // ensure required fields for each option
      const allOptionsValid = values.options?.every(option => option.code && option.code.trim() && option.price);
      if (!allOptionsValid) {
        const invalidOptionIndex = values.options?.findIndex(option => !option.code || !option.code.trim() || !option.price);
        let errorMessage = `Phiên bản ${invalidOptionIndex + 1}: `;
        if (!values.options[invalidOptionIndex].code || !values.options[invalidOptionIndex].code.trim()) {
          errorMessage += 'Vui lòng nhập mã phiên bản!';
        } else if (!values.options[invalidOptionIndex].price) {
          errorMessage += 'Vui lòng nhập giá!';
        }
        const newErrors = { ...optionErrors };
        newErrors[invalidOptionIndex] = errorMessage;
        setOptionErrors(newErrors);
        notification.error({
          message: 'Lỗi',
          description: errorMessage,
          placement: 'topRight',
        });
        setActiveTab(invalidOptionIndex.toString());
        return;
      }

      // check duplicate codes
      if (!validateOptionCodes(values)) return;

      // ensure each option has at least one image (since spec: images per option)
      const optionHasImages = values.options.every(opt => (opt.images && opt.images.length > 0) || (opt.existingImageUrls && opt.existingImageUrls.length > 0));
      if (!optionHasImages) {
        // find first option lacking images
        const idx = values.options.findIndex(opt => !(opt.images && opt.images.length > 0) && !(opt.existingImageUrls && opt.existingImageUrls.length > 0));
        notification.error({
          message: 'Lỗi',
          description: `Phiên bản ${idx + 1} chưa có ảnh. Vui lòng thêm ít nhất 1 ảnh cho mỗi phiên bản.`,
          placement: 'topRight',
        });
        setActiveTab(idx.toString());
        return;
      }

      // All good: pass options (includes images fileList) to next step
      const updatedOptions = form.getFieldValue('options') || [];
      // normalize each option.images to be an array (may be undefined)
      const normalizedOptions = updatedOptions.map(opt => ({ ...opt, images: opt.images || [], existingImageUrls: opt.existingImageUrls || [] }));
      onNext({ options: normalizedOptions });
    }).catch(err => {
      // move to first option with error
      if (err.errorFields && err.errorFields.length > 0) {
        const errorField = err.errorFields[0].name;
        if (errorField.length > 1 && errorField[0] === 'options') {
          const errorOptionIndex = errorField[1];
          setActiveTab(errorOptionIndex.toString());
          const errorMessage = `Phiên bản ${parseInt(errorOptionIndex) + 1}: ${err.errorFields[0].errors[0]}`;
          const newErrors = { ...optionErrors };
          newErrors[errorOptionIndex] = errorMessage;
          setOptionErrors(newErrors);
          notification.error({
            message: 'Lỗi',
            description: errorMessage,
            placement: 'topRight',
          });
        }
      }
    });
  };

  // Upload handlers: prevent auto upload and accept images only
  const beforeUploadOptionImage = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.error({
        message: 'Lỗi',
        description: 'Bạn chỉ có thể tải lên tệp hình ảnh!',
        placement: 'topRight',
      });
      return Upload.LIST_IGNORE;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      notification.error({
        message: 'Lỗi',
        description: 'Hình ảnh phải nhỏ hơn 10MB!',
        placement: 'topRight',
      });
      return Upload.LIST_IGNORE;
    }
    // return false to prevent auto-upload; we store files in form
    return false;
  };

  return (
    <Form 
      form={form} layout="vertical" 
      //initialValues={{ options }} 
      onFinish={handleSubmit}>
      <Card 
        title="Phiên bản sản phẩm" 
        bordered={false}
        extra={
          <Button type="dashed" onClick={addOption} icon={<PlusOutlined />}>
            Thêm phiên bản
          </Button>
        }
      >
        {Object.keys(optionErrors).length > 0 && (
          <Alert
            message="Lỗi thông tin phiên bản"
            description="Một số phiên bản có thông tin không hợp lệ. Vui lòng kiểm tra lại các mục được đánh dấu."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="editable-card"
          onEdit={(targetKey, action) => {
            if (action === 'add') addOption();
            else if (action === 'remove') removeOption(parseInt(targetKey));
          }}
        >
          {options.map((option, index) => (
            <TabPane
              tab={
                <span>
                  {`Phiên bản ${index + 1}`}
                  {optionErrors[index] && <Tag color="red" style={{ marginLeft: 8 }}>Lỗi</Tag>}
                </span>
              }
              key={index.toString()}
              closable={options.length > 1}
            >
              <div style={{ padding: '0 16px' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['options', index, 'code']}
                      label="Mã phiên bản"
                      rules={[{ required: true, message: 'Vui lòng nhập mã phiên bản!' }]}
                    >
                      <Input placeholder="VD: FX507ZC4" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['options', index, 'price']}
                      label="Giá"
                      rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                    >
                      <Input type="number" placeholder="0.00" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* ===== Upload gallery for this option ===== */}
                <Form.Item
                  name={['options', index, 'images']}
                  label="Ảnh của phiên bản (gallery)"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => (Array.isArray(e) ? e : (e && e.fileList))}
                  rules={[{ required: true, message: 'Vui lòng tải lên ít nhất 1 ảnh cho phiên bản này!' }]}
                >
                  <Upload
                    listType="picture-card"
                    multiple
                    beforeUpload={beforeUploadOptionImage}
                    accept="image/*"
                    // do not set onChange here, ant form will manage value
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  </Upload>
                </Form.Item>

                <Collapse defaultActiveKey={['1']} ghost>
                  <Panel header="Hiệu năng" key="1">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'cpu']} label="CPU">
                          <Input placeholder="VD: Intel Core i7-12700H" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'gpu']} label="GPU">
                          <Input placeholder="VD: NVIDIA RTX 3060" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>

                  <Panel header="Bộ nhớ & Lưu trữ" key="2">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'ram']} label="RAM">
                          <Input placeholder="VD: 16GB" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'ramType']} label="Loại RAM">
                          <Input placeholder="VD: DDR4" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'ramSlot']} label="Khe RAM">
                          <Input placeholder="VD: 2 khe" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'storage']} label="Lưu trữ">
                          <Input placeholder="VD: 512GB SSD" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'storageUpgrade']} label="Nâng cấp lưu trữ">
                          <Input placeholder="VD: Mở rộng lên đến 2TB" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>

                  <Panel header="Màn hình" key="3">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'displaySize']} label="Kích thước màn hình">
                          <Input placeholder="VD: 15.6 inch" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'displayResolution']} label="Độ phân giải">
                          <Input placeholder="VD: 1920x1080" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={['options', index, 'displayRefreshRate']} label="Tần số quét">
                          <Input placeholder="VD: 144Hz" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name={['options', index, 'displayTechnology']} label="Công nghệ màn hình">
                      <Input placeholder="VD: IPS, OLED, Mini-LED" />
                    </Form.Item>
                  </Panel>

                  <Panel header="Âm thanh & Camera" key="5">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'audioFeatures']} label="Tính năng âm thanh">
                          <Input placeholder="VD: Dolby Atmos, THX Spatial Audio" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'webcam']} label="Webcam">
                          <Input placeholder="VD: HD 720p, FHD 1080p với IR" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>

                  <Panel header="Tính năng khác" key="4">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'keyboard']} label="Bàn phím">
                          <Input placeholder="VD: Bàn phím có đèn nền" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'security']} label="Bảo mật">
                          <Input placeholder="VD: Cảm biến vân tay" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'os']} label="Hệ điều hành">
                          <Input placeholder="VD: Windows 11 Home" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'weight']} label="Trọng lượng">
                          <Input placeholder="VD: 2.1 kg" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'battery']} label="Pin">
                          <Input placeholder="VD: 4-cell, 70Wh" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'dimension']} label="Kích thước">
                          <Input placeholder="VD: 359 x 254 x 22.4 mm" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'wifi']} label="Wi-Fi">
                          <Input placeholder="VD: WiFi 6E (802.11ax)" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name={['options', index, 'bluetooth']} label="Bluetooth">
                          <Input placeholder="VD: Bluetooth 5.2" />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item name={['options', index, 'ports']} label="Cổng kết nối">
                      <Input placeholder="VD: 2x USB-A, 1x USB-C, HDMI, Ethernet" />
                    </Form.Item>
                    
                    <Form.Item name={['options', index, 'specialFeatures']} label="Tính năng đặc biệt">
                      <Input.TextArea placeholder="VD: Quạt tản nhiệt siêu mỏng, Công nghệ làm mát Vapor Chamber" />
                    </Form.Item>
                  </Panel>
                </Collapse>
              </div>
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onBack}>
            <ArrowLeftOutlined /> Quay lại
          </Button>
          <Button type="primary" htmlType="submit">
            Tiếp theo <ArrowRightOutlined />
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export {
  BasicInfoStep,
  OptionsStep
};
// CreateProduct_Part2_of_3.jsx

/* -------------------------
   VariantsStep (Step 3)
   KEEP variant: 1 image per color
   ------------------------- */
const VariantsStep = ({ form, onNext, onBack, initialValues }) => {
  const [activeTab, setActiveTab] = useState("0");
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState({});
  const [colorErrors, setColorErrors] = useState({});
  const notification = useContext(NotificationContext);

  

  useEffect(() => {
    if (initialValues.options?.length > 0) {
      setOptions(initialValues.options);
      form.setFieldsValue({ options: initialValues.options });
    } else {
      setOptions([{}]);
      form.setFieldsValue({ options: [{}] });
    }
    // eslint-disable-next-line
  }, []);


  // Init variants
  useEffect(() => {
    if (initialValues.variants && Object.keys(initialValues.variants).length > 0) {
      setVariants(initialValues.variants);
      form.setFieldsValue({ variants: initialValues.variants });
    } else if (options.length > 0) {
      const init = {};
      options.forEach((_, i) => {
        init[i] = [
          { color: "", priceDiff: 0, stock: 1, image: [] } // FIXED
        ];
      });
      setVariants(init);
      form.setFieldsValue({ variants: init });
    }
  }, [options]);

  // Đồng bộ form → state để ReviewStep nhận đúng data
  const syncFormToState = () => {
    setVariants(form.getFieldValue("variants") || {});
  };

  const addVariant = (opIdx) => {
    const data = form.getFieldValue("variants") || {};
    const newList = data[opIdx] || [];

    newList.push({ color: "", priceDiff: 0, stock: 1, image: [] });

    const newData = { ...data, [opIdx]: newList };
    form.setFieldsValue({ variants: newData });
    setVariants(newData);
  };

  const removeVariant = (opIdx, vIdx) => {
    const data = form.getFieldValue("variants") || {};

    if (!data[opIdx] || data[opIdx].length <= 1) {
      notification.warning({
        message: "Cảnh báo",
        description: "Cần có ít nhất một màu sắc"
      });
      return;
    }

    data[opIdx] = data[opIdx].filter((_, i) => i !== vIdx);

    form.setFieldsValue({ variants: data });
    setVariants(data);

    validateColorsForOption(opIdx, data);
  };

  // Validate màu trùng
  const validateColorsForOption = (opIdx, all = variants) => {
    const list = all[opIdx] || [];
    const colors = list.map(v => v.color?.trim().toLowerCase()).filter(Boolean);

    const unique = new Set(colors);
    if (unique.size !== colors.length) {
      const duplicated = colors.filter((c, i) => colors.indexOf(c) !== i);

      setColorErrors(prev => ({
        ...prev,
        [opIdx]: `Màu "${duplicated[0]}" bị trùng!`
      }));

      return false;
    }

    setColorErrors(prev => {
      const copy = { ...prev };
      delete copy[opIdx];
      return copy;
    });

    return true;
  };

  const validateAllColors = () => {
    let valid = true;
    const all = form.getFieldValue("variants") || {};

    Object.keys(all).forEach(idx => {
      if (!validateColorsForOption(idx, all)) valid = false;
    });

    return valid;
  };

  const beforeUploadVariantImage = (file) => {
    if (!file.type.startsWith("image/")) {
      notification.error({ message: "Chỉ được tải ảnh!" });
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      notification.error({ message: "Ảnh phải < 5MB" });
      return Upload.LIST_IGNORE;
    }
    return false; // Không upload auto
  };

  const handleSubmit = () => {
    const all = form.getFieldValue("variants") || {};

    // Kiểm tra đầy đủ dữ liệu bằng FORM (KHÔNG dùng state)
    const allValid = options.every((_, opIdx) => {
      const list = all[opIdx] || [];

      return list.every(v =>
        v.color &&
        v.stock &&
        v.image &&
        v.image.length > 0
      );
    });

    if (!allValid) {
      const opIdx = options.findIndex((_, i) => {
        const list = all[i] || [];
        return list.some(v => !v.color || !v.stock || !v.image || v.image.length === 0);
      });

      notification.error({
        message: "Lỗi",
        description: `Phiên bản ${opIdx + 1} có màu chưa đủ thông tin`
      });

      setActiveTab(opIdx.toString());
      return;
    }

    if (!validateAllColors()) {
      const firstErr = Object.keys(colorErrors)[0];
      if (firstErr) setActiveTab(firstErr.toString());
      return;
    }

    syncFormToState(); // update state trước khi sang bước 4

    onNext({ variants: form.getFieldValue("variants") });
  };

  return (
    <Form form={form} layout="vertical" onValuesChange={syncFormToState}>
      <Card title="Màu sắc sản phẩm" bordered={false}>

        {Object.keys(colorErrors).length > 0 && (
          <Alert message="Lỗi trùng màu" type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {options.map((option, opIdx) => (
            <TabPane
              tab={
                <span>
                  Phiên bản {opIdx + 1}: {option.code}
                  {colorErrors[opIdx] && <Tag color="red">Lỗi</Tag>}
                </span>
              }
              key={opIdx.toString()}
            >

              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addVariant(opIdx)}
                style={{ marginBottom: 16 }}
              >
                Thêm màu sắc
              </Button>

              {colorErrors[opIdx] && (
                <Alert message={colorErrors[opIdx]} type="error" showIcon style={{ marginBottom: 16 }} />
              )}

              {(variants[opIdx] || []).map((variant, vIdx) => (
                <Card
                  key={vIdx}
                  title={`Màu ${vIdx + 1}`}
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeVariant(opIdx, vIdx)}
                      disabled={(variants[opIdx] || []).length <= 1}
                    />
                  }
                >
                  <Form.Item
                    name={['variants', opIdx, vIdx, 'color']}
                    label="Màu sắc"
                    rules={[{ required: true, message: 'Nhập màu sắc!' }]}
                  >
                    <Input placeholder="Đen, Bạc, Xám..." />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={['variants', opIdx, vIdx, 'priceDiff']}
                        label="Chênh lệch giá"
                      >
                        <Input type="number" placeholder="0" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={['variants', opIdx, vIdx, 'stock']}
                        label="Số lượng"
                        rules={[{ required: true, message: 'Nhập số lượng!' }]}
                      >
                        <Input type="number" placeholder="0" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* ẢNH 1 MÀU */}
                  <Form.Item
                    name={['variants', opIdx, vIdx, 'image']}
                    label="Ảnh màu sắc"
                    valuePropName="fileList"
                    getValueFromEvent={e => e.fileList}
                    rules={[{ required: true, message: 'Chọn ảnh màu sắc!' }]}
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={beforeUploadVariantImage}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                      </div>
                    </Upload>
                  </Form.Item>

                </Card>
              ))}

            </TabPane>
          ))}
        </Tabs>

      </Card>

      <div style={{ textAlign: "right", marginTop: 24 }}>
        <Space>
          <Button onClick={() => onBack({ variants })}>
            <ArrowLeftOutlined /> Quay lại
          </Button>
          <Button type="primary" onClick={handleSubmit}>
            Tiếp theo <ArrowRightOutlined />
          </Button>
        </Space>
      </div>
    </Form>
  );
};

/* -------------------------
   ReviewStep (Step 4)
   Show:
   - Gallery per option
   - Variant single image
   ------------------------- */
const ReviewStep = ({ formData, onSubmit, onBack }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const notification = useContext(NotificationContext);
  const navigate = useNavigate();

  // const handleSubmit = async () => {
  //   setLoading(true);

  //   try {
  //     const formDataObj = new FormData();

  //     // Basic info
  //     formDataObj.append("name", formData.basicInfo.name);
  //     formDataObj.append("description", formData.basicInfo.description || "");
  //     formDataObj.append("categoryId", formData.basicInfo.categoryId);
  //     formDataObj.append("brandId", formData.basicInfo.brandId);

  //     // --------------------------
  //     // OPTION IMAGES (gallery)
  //     // --------------------------
  //     formData.options.forEach((opt, opIndex) => {
  //       const base = `options[${opIndex}]`;

  //       formDataObj.append(`${base}.code`, opt.code);
  //       formDataObj.append(`${base}.price`, opt.price);

  //       // Append all images for each option
  //       if (opt.images) {
  //         opt.images.forEach(img => {
  //           if (img.originFileObj) {
  //             formDataObj.append(`${base}.images`, img.originFileObj);
  //           }
  //         });
  //       }

  //       // Technical specs
  //       formDataObj.append(`${base}.cpu`, opt.cpu || '');
  //       formDataObj.append(`${base}.gpu`, opt.gpu || '');
  //       formDataObj.append(`${base}.ram`, opt.ram || '');
  //       formDataObj.append(`${base}.ramType`, opt.ramType || '');
  //       formDataObj.append(`${base}.ramSlot`, opt.ramSlot || '');
  //       formDataObj.append(`${base}.storage`, opt.storage || '');
  //       formDataObj.append(`${base}.storageUpgrade`, opt.storageUpgrade || '');
  //       formDataObj.append(`${base}.displaySize`, opt.displaySize || '');
  //       formDataObj.append(`${base}.displayResolution`, opt.displayResolution || '');
  //       formDataObj.append(`${base}.displayRefreshRate`, opt.displayRefreshRate || '');
  //       formDataObj.append(`${base}.displayTechnology`, opt.displayTechnology || '');
  //       formDataObj.append(`${base}.audioFeatures`, opt.audioFeatures || '');
  //       formDataObj.append(`${base}.webcam`, opt.webcam || '');
  //       formDataObj.append(`${base}.keyboard`, opt.keyboard || '');
  //       formDataObj.append(`${base}.security`, opt.security || '');
  //       formDataObj.append(`${base}.os`, opt.os || '');
  //       formDataObj.append(`${base}.weight`, opt.weight || '');
  //       formDataObj.append(`${base}.battery`, opt.battery || '');
  //       formDataObj.append(`${base}.dimension`, opt.dimension || '');
  //       formDataObj.append(`${base}.wifi`, opt.wifi || '');
  //       formDataObj.append(`${base}.bluetooth`, opt.bluetooth || '');
  //       formDataObj.append(`${base}.ports`, opt.ports || '');
  //       formDataObj.append(`${base}.specialFeatures`, opt.specialFeatures || '');

  //       // Add variants
  //       const optionVariants = formData.variants[opIndex] || [];
  //       optionVariants.forEach((variant, vIndex) => {
  //         const vBase = `${base}.variants[${vIndex}]`;
  //         formDataObj.append(`${vBase}.color`, variant.color);
  //         formDataObj.append(`${vBase}.priceDiff`, variant.priceDiff || 0);
  //         formDataObj.append(`${vBase}.stock`, variant.stock);

  //         // Variant 1 IMAGE
  //         if (variant.image && variant.image[0] && variant.image[0].originFileObj) {
  //           formDataObj.append(`${vBase}.image`, variant.image[0].originFileObj);
  //         }
  //       });
  //     });

  //     //const response = await dispatch(adminCreateProduct(formDataObj));

  //     // if (response === 201) {
  //     //   notification.success({ message: 'Thành công', description: 'Thêm sản phẩm thành công!' });
  //     //   //onSubmit();
  //     //   navigate('/admin/laptops');
  //     // } else {
  //     //   notification.error({ message: 'Lỗi', description: 'Thêm sản phẩm thất bại!' });
  //     // }
      
  //       const status = await dispatch(adminCreateProduct(formDataObj));
  //       if (status === 201) {
  //         notification.success({ message: 'Thành công', description: 'Thêm sản phẩm thành công!' });
  //         navigate('/admin/laptops');
  //       }
  //   }
  //      catch (error) {
  //       if (error?.response?.status === 409) {
  //         notification.error({
  //           message: 'Lỗi trùng dữ liệu',
  //           description: error.response.data.message
  //         });
  //       } else {
  //         notification.error({
  //           message: 'Lỗi',
  //           description: 'Có lỗi xảy ra khi thêm sản phẩm'
  //         });
  //       }
      

  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async () => {
  setLoading(true);

  try {
    const formDataObj = new FormData();

    // ===== Basic info =====
    formDataObj.append("name", formData.basicInfo.name);
    formDataObj.append("description", formData.basicInfo.description || "");
    formDataObj.append("categoryId", formData.basicInfo.categoryId);
    formDataObj.append("brandId", formData.basicInfo.brandId);

    // ===== Options =====
    formData.options.forEach((opt, opIndex) => {
      const base = `options[${opIndex}]`;

      formDataObj.append(`${base}.code`, opt.code);
      formDataObj.append(`${base}.price`, opt.price);

      // Images
      opt.images?.forEach(img => {
        if (img.originFileObj) {
          formDataObj.append(`${base}.images`, img.originFileObj);
        }
      });

      // Specs
      formDataObj.append(`${base}.cpu`, opt.cpu || "");
      formDataObj.append(`${base}.gpu`, opt.gpu || "");
      formDataObj.append(`${base}.ram`, opt.ram || "");
      formDataObj.append(`${base}.ramType`, opt.ramType || "");
      formDataObj.append(`${base}.ramSlot`, opt.ramSlot || "");
      formDataObj.append(`${base}.storage`, opt.storage || "");
      formDataObj.append(`${base}.storageUpgrade`, opt.storageUpgrade || "");
      formDataObj.append(`${base}.displaySize`, opt.displaySize || "");
      formDataObj.append(`${base}.displayResolution`, opt.displayResolution || "");
      formDataObj.append(`${base}.displayRefreshRate`, opt.displayRefreshRate || "");
      formDataObj.append(`${base}.displayTechnology`, opt.displayTechnology || "");
      formDataObj.append(`${base}.audioFeatures`, opt.audioFeatures || "");
      formDataObj.append(`${base}.webcam`, opt.webcam || "");
      formDataObj.append(`${base}.keyboard`, opt.keyboard || "");
      formDataObj.append(`${base}.security`, opt.security || "");
      formDataObj.append(`${base}.os`, opt.os || "");
      formDataObj.append(`${base}.weight`, opt.weight || "");
      formDataObj.append(`${base}.battery`, opt.battery || "");
      formDataObj.append(`${base}.dimension`, opt.dimension || "");
      formDataObj.append(`${base}.wifi`, opt.wifi || "");
      formDataObj.append(`${base}.bluetooth`, opt.bluetooth || "");
      formDataObj.append(`${base}.ports`, opt.ports || "");
      formDataObj.append(`${base}.specialFeatures`, opt.specialFeatures || "");

      // Variants
      const variants = formData.variants[opIndex] || [];
      variants.forEach((variant, vIndex) => {
        const vBase = `${base}.variants[${vIndex}]`;
        formDataObj.append(`${vBase}.color`, variant.color);
        formDataObj.append(`${vBase}.priceDiff`, variant.priceDiff || 0);
        formDataObj.append(`${vBase}.stock`, variant.stock);

        if (variant.image?.[0]?.originFileObj) {
          formDataObj.append(`${vBase}.image`, variant.image[0].originFileObj);
        }
      });
    });

    // ===== CALL API =====
    const res = await dispatch(adminCreateProduct(formDataObj));
    console.log("CREATED PRODUCT:", res);

    // ✅ THÀNH CÔNG: có product.id
    if (res?.code === 201 && res?.data?.id) {
      notification.success({
        message: "Thành công",
        description: "Thêm sản phẩm thành công!"
      });
      navigate("/admin/laptops");
    } else {
      notification.error({
        message: "Lỗi",
        description: "Thêm sản phẩm thất bại"
      });
    }

  } catch (error) {
    if (error?.response?.status === 409) {
      notification.error({
        message: "Lỗi trùng dữ liệu",
        description: error.response.data.message
      });
    } else {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi thêm sản phẩm"
      });
    }
  } finally {
    setLoading(false);
  }
};



  return (
    <>
      <Card title="Xem lại thông tin" bordered={false}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên sản phẩm">
            {formData.basicInfo.name}
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">{formData.basicInfo.categoryName}</Descriptions.Item>
          <Descriptions.Item label="Thương hiệu">{formData.basicInfo.brandName}</Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            <div dangerouslySetInnerHTML={{ __html: formData.basicInfo.description }} />
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* OPTIONS LIST */}
        <Collapse>
          {formData.options.map((opt, opIdx) => (
            <Panel 
              header={`Phiên bản ${opIdx + 1}: ${opt.code}`} 
              key={opIdx}
              extra={<Tag color="blue">{opt.price}đ</Tag>}
            >
              <Divider orientation="left">Ảnh phiên bản (Gallery)</Divider>

              <Row gutter={12}>
                {opt.images?.map((img, i) => (
                  <Col span={6} key={i}>
                    <Image
                      width={120}
                      height={120}
                      src={img.thumbUrl || img.url || URL.createObjectURL(img.originFileObj)}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  </Col>
                ))}
              </Row>

              <Divider orientation="left">Thông số</Divider>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="CPU">{opt.cpu || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="GPU">{opt.gpu || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="RAM">{opt.ram || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Loại RAM">{opt.ramType || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Khe RAM">{opt.ramSlot || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Lưu trữ">{opt.storage || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Nâng cấp">{opt.storageUpgrade || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Màn hình">{opt.displaySize || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Độ phân giải">{opt.displayResolution || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Tần số">{opt.displayRefreshRate || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Công nghệ">{opt.displayTechnology || 'N/A'}</Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Màu sắc</Divider>
              <Row gutter={16}>
                {formData.variants[opIdx]?.map((variant, vIdx) => (
                  <Col span={8} key={vIdx}>
                    <Card
                      title={`Màu ${vIdx + 1}: ${variant.color}`}
                      style={{ marginBottom: 16 }}
                    >
                      <Avatar
                        src={
                          variant.image?.[0]?.thumbUrl ||
                          variant.image?.[0]?.url ||
                          (variant.image?.[0]?.originFileObj &&
                            URL.createObjectURL(variant.image[0].originFileObj))
                        }
                        shape="square"
                        size={80}
                        style={{ marginBottom: 12 }}
                      />
                      <div><b>Số lượng:</b> {variant.stock}</div>
                      {variant.priceDiff !== 0 && (
                        <div><b>Chênh lệch giá:</b> {variant.priceDiff}đ</div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </Panel>
          ))}
        </Collapse>
      </Card>

      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={onBack}><ArrowLeftOutlined /> Quay lại</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            Thêm mới <CheckOutlined />
          </Button>
        </Space>
      </div>
    </>
  );
};

export {
  VariantsStep,
  ReviewStep
};


const steps = [
  { title: 'Thông tin cơ bản' },
  { title: 'Phiên bản (Option)' },
  { title: 'Màu sắc (Variant)' },
  { title: 'Xác nhận' }
];

const ProductCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // Step forms
  const [basicInfoForm] = Form.useForm();
  const [optionsForm] = Form.useForm();
  const [variantsForm] = Form.useForm();

  // Data collected from previous steps
  const [formData, setFormData] = useState({
    basicInfo: {},
    options: [],
    variants: {}
  });

  const notification = useContext(NotificationContext);

  const nextStep = (stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = (stepData) => {
    if (stepData) {
      setFormData((prev) => ({ ...prev, ...stepData }));
    }
    setCurrentStep((prev) => prev - 1);
  };

  

  return (
    <div className="container">
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((s) => (
          <Steps.Step key={s.title} title={s.title} />
        ))}
      </Steps>

      {currentStep === 0 && (
        <BasicInfoStep
          form={basicInfoForm}
          initialValues={formData.basicInfo}
          onNext={(data) => nextStep({ basicInfo: data })}
        />
      )}

      {currentStep === 1 && (
        <OptionsStep
          form={optionsForm}
          initialValues={formData.options}
          onBack={() => previousStep()}
          onNext={(data) => nextStep({ options: data.options })}
        />
      )}

      {currentStep === 2 && (
        <VariantsStep
          form={variantsForm}
          initialValues={formData}
          onBack={(data) => previousStep(data)}
          onNext={(data) => nextStep({ variants: data.variants })}
        />
      )}

      {currentStep === 3 && (
        <ReviewStep
          formData={formData}
          onBack={() => previousStep()}
          //onSubmit={handleFinish}
        />
      )}
    </div>
  );
};

/* -------------------------
   CreateProduct Page
------------------------- */
const CreateProduct = () => {
  return (
    <div style={{ padding: 24 }}>
      <Card title="Thêm Sản Phẩm Mới" bordered={false}>
        <ProductCreationWizard />
      </Card>
    </div>
  );
};

export default CreateProduct;
