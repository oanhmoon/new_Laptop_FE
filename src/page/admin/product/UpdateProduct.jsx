import React, {useContext, useEffect, useState} from 'react';

import {
  Steps,
  Card,
  Form,
  Input,
  Button,
  Select,
  Upload,
  message,
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
  Image,
  Spin,
  Modal
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  CheckOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { adminUpdateProduct, getAllBrands, getAllCategories, adminDetailProduct } from '../../../Redux/actions/ProductThunk';
import {NotificationContext} from "../../../components/NotificationProvider";

const { Step } = Steps;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

// Step 1: Basic Information - NO PRODUCT-LEVEL IMAGES (matching CreateProduct exactly)
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

  const handleFinish = (values) => {
    // Map category and brand names from ID
    const category = categories.find(cat => cat.id === values.categoryId);
    const brand = brands.find(b => b.id === values.brandId);
    
    onNext({
      ...values,
      categoryName: category?.name,
      brandName: brand?.name
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleFinish} // do not include images here
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

// BasicInfoStep - không còn upload ảnh cấp product
// ================= BasicInfoStep (NO PRODUCT IMAGES) =================



// const BasicInfoStep = ({ form, onNext, initialValues, categories = [], brands = [] }) => {
//   const notification = useContext(NotificationContext);

//   // Điền giá trị mặc định
//   useEffect(() => {
//     if (initialValues) {
//       form.setFieldsValue({
//         name: initialValues.name,
//         description: initialValues.description,
//         categoryId: initialValues.categoryId,
//         brandId: initialValues.brandId,
//       });
//     }
//   }, [initialValues]);

//   const handleSubmit = () => {
//     form.validateFields()
//       .then(values => {
//         onNext(values);
//       })
//       .catch(() => {
//         notification.error({
//           message: "Lỗi",
//           description: "Vui lòng nhập đầy đủ thông tin!",
//         });
//       });
//   };

//   return (
//     <Form form={form} layout="vertical">
//       <Card title="Thông tin cơ bản" bordered={false}>
//         <Form.Item
//           label="Tên sản phẩm"
//           name="name"
//           rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
//         >
//           <Input placeholder="Nhập tên sản phẩm..." />
//         </Form.Item>

//         <Form.Item label="Mô tả" name="description">
//   <ReactQuill
//     theme="snow"
//     placeholder="Nhập mô tả sản phẩm..."
//     style={{ height: 200 }}
//   />
// </Form.Item>


//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item
//               label="Danh mục"
//               name="categoryId"
//               rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
//             >
//               <Select placeholder="Chọn danh mục">
//                 {categories.map(c => (
//                   <Option key={c.id} value={c.id}>
//                     {c.name}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           </Col>

//           <Col span={12}>
//             <Form.Item
//               label="Thương hiệu"
//               name="brandId"
//               rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}
//             >
//               <Select placeholder="Chọn thương hiệu">
//                 {brands.map(b => (
//                   <Option key={b.id} value={b.id}>
//                     {b.name}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           </Col>
//         </Row>
//       </Card>

//       <div style={{ textAlign: "right", marginTop: 24 }}>
//         <Button type="primary" onClick={handleSubmit}>
//           Tiếp theo <ArrowRightOutlined />
//         </Button>
//       </div>
//     </Form>
//   );
// };






// Step 2: Product Options
// const OptionsStep = ({ form, onNext, onBack, initialValues, deletedOptionIds, setDeletedOptionIds }) => {
//   const [activeTab, setActiveTab] = useState('0');
//   const [options, setOptions] = useState([{}]);
//   const [codeErrors, setCodeErrors] = useState(null);
//   const [optionErrors, setOptionErrors] = useState({});
//   const notification = useContext(NotificationContext);
//   // Cập nhật options từ initialValues
//   useEffect(() => {
//     if (initialValues.options && initialValues.options.length > 0) {
//       setOptions(initialValues.options);
//       form.setFieldsValue({ options: initialValues.options });
//     }
//   }, [initialValues.options, form]);
  
//   const addOption = () => {
//     const newOptions = [...options, {}];
//     setOptions(newOptions);
//     setActiveTab(newOptions.length - 1 + '');
//   };

//   const removeOption = (index) => {
//     if (options.length <= 1) {
//       notification.error({
//         message: 'Lỗi',
//         description: 'Cần có ít nhất một phiên bản',
//         placement: 'topRight',
//       });
//       return;
//     }
    
//     // Nếu option có id, thêm vào danh sách xóa
//     const optionToRemove = options[index];
//     if (optionToRemove && optionToRemove.id) {
//       // Đảm bảo deletedOptionIds là một mảng
//       const currentDeletedIds = Array.isArray(deletedOptionIds) ? [...deletedOptionIds] : [];
//       setDeletedOptionIds([...currentDeletedIds, optionToRemove.id]);
//       notification.success({
//         message: 'Thành công',
//         description: `Đã đánh dấu phiên bản ${optionToRemove.code} để xóa`,
//         placement: 'topRight',
//       });
//     }

//     // Cập nhật lại danh sách options
//     const newOptions = options.filter((_, i) => i !== index);
//     setOptions(newOptions);
    
//     // Cập nhật lại form để đảm bảo dữ liệu form được đồng bộ
//     form.setFieldsValue({ options: newOptions });
    
//     // Chuyển tab đến tab gần nhất
//     setActiveTab(Math.max(0, index - 1) + '');
    
//     // Xóa lỗi nếu có
//     const newErrors = { ...optionErrors };
//     delete newErrors[index];
    
//     // Cập nhật lại các index của các lỗi
//     const updatedErrors = {};
//     Object.keys(newErrors).forEach(errIndex => {
//       const errIndexNum = parseInt(errIndex);
//       if (errIndexNum > index) {
//         updatedErrors[errIndexNum - 1] = newErrors[errIndexNum];
//       } else {
//         updatedErrors[errIndexNum] = newErrors[errIndexNum];
//       }
//     });
    
//     setOptionErrors(updatedErrors);
//   };

//   // Kiểm tra trùng lặp mã phiên bản
//   const validateOptionCodes = (values) => {
//     const optionValues = values.options || [];
//     const codes = optionValues.map(option => option.code?.trim())
//                             .filter(Boolean);
    
//     // Kiểm tra trùng lặp
//     const uniqueCodes = new Set(codes);
//     if (uniqueCodes.size !== codes.length) {
//       const duplicateCodes = codes.filter((code, index) => 
//         codes.indexOf(code) !== index
//       );
      
//       const errorIndexes = [];
//       optionValues.forEach((option, index) => {
//         if (option.code && duplicateCodes.includes(option.code.trim())) {
//           errorIndexes.push(index);
//         }
//       });
      
//       const newErrors = {};
//       errorIndexes.forEach(index => {
//         newErrors[index] = `Mã phiên bản "${optionValues[index].code}" bị trùng lặp.`;
//       });
      
//       setOptionErrors(newErrors);
//       notification.error({
//         message: 'Lỗi',
//         description: `Mã phiên bản "${duplicateCodes[0]}" bị trùng lặp. Mỗi phiên bản phải có mã khác nhau.`,
//         placement: 'topRight',
//       });
//       setCodeErrors(null);
      
//       if (errorIndexes.length > 0) {
//         setActiveTab(errorIndexes[0] + '');
//       }
      
//       return false;
//     }
    
//     setCodeErrors(null);
//     setOptionErrors({});
//     return true;
//   };

//   const handleSubmit = (values) => {
//     form.validateFields().then(values => {
//       const allOptionsValid = values.options?.every((option, index) => {
//         return (
//           option.code && 
//           option.code.trim() && 
//           option.price
//         );
//       });

//       if (!allOptionsValid) {
//         const invalidOptionIndex = values.options?.findIndex((option, index) => {
//           return !option.code || !option.code.trim() || !option.price;
//         });
        
//         let errorMessage = `Phiên bản ${invalidOptionIndex + 1}: `;
//         if (!values.options[invalidOptionIndex].code || !values.options[invalidOptionIndex].code.trim()) {
//           errorMessage += 'Vui lòng nhập mã phiên bản!';
//           const newErrors = { ...optionErrors };
//           newErrors[invalidOptionIndex] = errorMessage;
//           setOptionErrors(newErrors);
//         } else if (!values.options[invalidOptionIndex].price) {
//           errorMessage += 'Vui lòng nhập giá!';
//           const newErrors = { ...optionErrors };
//           newErrors[invalidOptionIndex] = errorMessage;
//           setOptionErrors(newErrors);
//         }

//         notification.error({
//           message: 'Lỗi',
//           description: errorMessage,
//           placement: 'topRight',
//         });
//         setActiveTab(invalidOptionIndex + '');
//         return;
//       }
      
//       setOptionErrors({});
      
//       if (!validateOptionCodes(values)) {
//         return;
//       }
      
//       const updatedOptions = form.getFieldValue('options');
//       onNext({ 
//         options: updatedOptions,
//         deletedOptionIds: Array.isArray(deletedOptionIds) ? deletedOptionIds : []
//       });
//     }).catch(error => {
//       console.log('Validation failed:', error);
      
//       if (error.errorFields && error.errorFields.length > 0) {
//         const errorField = error.errorFields[0].name;
//         if (errorField.length > 1 && errorField[0] === 'options') {
//           const errorOptionIndex = errorField[1];
//           setActiveTab(errorOptionIndex + '');
          
//           const errorMessage = `Phiên bản ${parseInt(errorOptionIndex) + 1}: ${error.errorFields[0].errors[0]}`;
//           notification.error({
//             message: 'Lỗi',
//             description: errorMessage,
//             placement: 'topRight',
//           });
          
//           const newErrors = { ...optionErrors };
//           newErrors[errorOptionIndex] = errorMessage;
//           setOptionErrors(newErrors);
//         }
//       }
//     });
//   };

//   return (
//     <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ options }}>
//       <Card 
//         title="Phiên bản sản phẩm" 
//         bordered={false}
//         extra={
//           <Button type="dashed" onClick={addOption} icon={<PlusOutlined />}>
//             Thêm phiên bản
//           </Button>
//         }
//       >
//         {Object.keys(optionErrors).length > 0 && (
//           <Alert
//             message="Lỗi thông tin phiên bản"
//             description="Một số phiên bản có thông tin không hợp lệ. Vui lòng kiểm tra lại các mục được đánh dấu."
//             type="error"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
        
//         {Array.isArray(deletedOptionIds) && deletedOptionIds.length > 0 && (
//           <Alert
//             message={`Đã đánh dấu ${deletedOptionIds.length} phiên bản để xóa`}
//             description="Các phiên bản này sẽ bị xóa khi bạn lưu thay đổi."
//             type="warning"
//             showIcon
//             style={{ marginBottom: 16 }}
//           />
//         )}
        
//         <Tabs
//           activeKey={activeTab}
//           onChange={setActiveTab}
//           type="editable-card"
//           onEdit={(targetKey, action) => {
//             if (action === 'add') {
//               addOption();
//             } else if (action === 'remove') {
//               removeOption(parseInt(targetKey));
//             }
//           }}
//         >
//           {options.map((option, index) => (
//             <TabPane
//               tab={
//                 <span>
//                   {`Phiên bản ${index + 1}${option.code ? `: ${option.code}` : ''}`}
//                   {optionErrors[index] && <Tag color="red" style={{ marginLeft: 8 }}>Lỗi</Tag>}
//                 </span>
//               }
//               key={index + ''}
//               closable={options.length > 1}
//             >
//               <div style={{ padding: '0 16px' }}>
//                 <Row gutter={16}>
//                   <Col span={12}>
//                     <Form.Item
//                       name={['options', index, 'id']}
//                       hidden={true}
//                     >
//                       <Input />
//                     </Form.Item>
//                     <Form.Item
//                       name={['options', index, 'code']}
//                       label="Mã phiên bản"
//                       rules={[{ required: true, message: 'Vui lòng nhập mã phiên bản!' }]}
//                     >
//                       <Input placeholder="VD: FX507ZC4" />
//                     </Form.Item>
//                   </Col>
//                   <Col span={12}>
//                     <Form.Item
//                       name={['options', index, 'price']}
//                       label="Giá"
//                       rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
//                     >
//                       <Input type="number" placeholder="0.00" />
//                     </Form.Item>
//                   </Col>
//                 </Row>

//                 <Collapse defaultActiveKey={['1']} ghost>
//                   <Panel header="Hiệu năng" key="1">
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'cpu']} label="CPU">
//                           <Input placeholder="VD: Intel Core i7-12700H" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'gpu']} label="GPU">
//                           <Input placeholder="VD: NVIDIA RTX 3060" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Panel>

//                   <Panel header="Bộ nhớ & Lưu trữ" key="2">
//                     <Row gutter={16}>
//                       <Col span={8}>
//                         <Form.Item name={['options', index, 'ram']} label="RAM">
//                           <Input placeholder="VD: 16GB" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={8}>
//                         <Form.Item name={['options', index, 'ramType']} label="Loại RAM">
//                           <Input placeholder="VD: DDR4" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={8}>
//                         <Form.Item name={['options', index, 'ramSlot']} label="Khe RAM">
//                           <Input placeholder="VD: 2 khe" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'storage']} label="Lưu trữ">
//                           <Input placeholder="VD: 512GB SSD" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'storageUpgrade']} label="Nâng cấp lưu trữ">
//                           <Input placeholder="VD: Mở rộng lên đến 2TB" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Panel>

//                   <Panel header="Màn hình" key="3">
//                     <Row gutter={16}>
//                       <Col span={8}>
//                         <Form.Item name={['options', index, 'displaySize']} label="Kích thước màn hình">
//                           <Input placeholder="VD: 15.6 inch" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={8}>
//                         <Form.Item name={['options', index, 'displayResolution']} label="Độ phân giải">
//                           <Input placeholder="VD: 1920x1080" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={8}>
//                         <Form.Item name={['options', index, 'displayRefreshRate']} label="Tần số quét">
//                           <Input placeholder="VD: 144Hz" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                     <Form.Item name={['options', index, 'displayTechnology']} label="Công nghệ màn hình">
//                       <Input placeholder="VD: IPS, OLED, Mini-LED" />
//                     </Form.Item>
//                   </Panel>

//                   <Panel header="Âm thanh & Camera" key="5">
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'audioFeatures']} label="Tính năng âm thanh">
//                           <Input placeholder="VD: Dolby Atmos, THX Spatial Audio" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'webcam']} label="Webcam">
//                           <Input placeholder="VD: HD 720p, FHD 1080p với IR" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
//                   </Panel>

//                   <Panel header="Tính năng khác" key="4">
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'keyboard']} label="Bàn phím">
//                           <Input placeholder="VD: Bàn phím có đèn nền" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'security']} label="Bảo mật">
//                           <Input placeholder="VD: Cảm biến vân tay" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
                    
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'operatingSystem']} label="Hệ điều hành">
//                           <Input placeholder="VD: Windows 11 Home" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'weight']} label="Trọng lượng">
//                           <Input placeholder="VD: 2.1 kg" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
                    
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'battery']} label="Pin">
//                           <Input placeholder="VD: 4-cell, 70Wh" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'dimension']} label="Kích thước">
//                           <Input placeholder="VD: 359 x 254 x 22.4 mm" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
                    
//                     <Row gutter={16}>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'wifi']} label="Wi-Fi">
//                           <Input placeholder="VD: WiFi 6E (802.11ax)" />
//                         </Form.Item>
//                       </Col>
//                       <Col span={12}>
//                         <Form.Item name={['options', index, 'bluetooth']} label="Bluetooth">
//                           <Input placeholder="VD: Bluetooth 5.2" />
//                         </Form.Item>
//                       </Col>
//                     </Row>
                    
//                     <Form.Item name={['options', index, 'ports']} label="Cổng kết nối">
//                       <Input placeholder="VD: 2x USB-A, 1x USB-C, HDMI, Ethernet" />
//                     </Form.Item>
                    
//                     <Form.Item name={['options', index, 'specialFeatures']} label="Tính năng đặc biệt">
//                       <Input.TextArea placeholder="VD: Quạt tản nhiệt siêu mỏng, Công nghệ làm mát Vapor Chamber" />
//                     </Form.Item>
//                   </Panel>
//                 </Collapse>
//               </div>
//             </TabPane>
//           ))}
//         </Tabs>
//       </Card>

//       <div style={{ marginTop: 24, textAlign: 'right' }}>
//         <Space>
//           <Button onClick={onBack}>
//             <ArrowLeftOutlined /> Quay lại
//           </Button>
//           <Button type="primary" htmlType="submit">
//             Tiếp theo <ArrowRightOutlined />
//           </Button>
//         </Space>
//       </div>
//     </Form>
//   );
// };

// ========================== OPTIONS STEP (GALLERY PER OPTION - MATCHING CREATEPRODUCT) ==========================

const OptionsStep = ({
  form,
  onNext,
  onBack,
  initialValues,
  deletedOptionIds,
  setDeletedOptionIds
}) => {
  const [activeTab, setActiveTab] = useState('0');
  const [options, setOptions] = useState([{}]);
  const [optionErrors, setOptionErrors] = useState({});
  const [imageState, setImageState] = useState({}); 
  // imageState structure:
  // imageState[optionIndex] = { existingImages: [], newImages: [], deletedImageIds: [] }
  const notification = useContext(NotificationContext);

  // Load initial options when entering step
  useEffect(() => {
    if (initialValues?.options && initialValues.options.length > 0) {
      const activeOptions = initialValues.options.filter(
        opt => !deletedOptionIds.includes(opt.id)
      );

      // Ensure each option has an images array (for UI)
      const normalized = activeOptions.map(opt => ({
        ...opt,
        images: opt.images || []
      }));

      setOptions(normalized.length > 0 ? normalized : [{}]);

      // Build image state for each option
      const imgState = {};
      normalized.forEach((opt, index) => {
        imgState[index] = {
          existingImages: opt.images?.map(img => ({
            uid: `existing-${img.id}`,
            id: img.id,
            name: `image-${img.id}.jpg`,
            status: "done",
            url: img.url,
            thumbUrl: img.url,
            isExisting: true
          })) || [],
          newImages: [],
          deletedImageIds: []
        };
      });

      setImageState(imgState);
      form.setFieldsValue({ options: normalized.length > 0 ? normalized : [{}] });
    }
  }, [initialValues, deletedOptionIds, form]);

  const addOption = () => {
    // const newOptions = [...options, {}];
    const newOptions = [...options, { images: [] }];
    setOptions(newOptions);
    setActiveTab((newOptions.length - 1).toString());
    
    setImageState(prev => ({
      ...prev,
      [newOptions.length - 1]: {
        existingImages: [],
        newImages: [],
        deletedImageIds: []
      }
    }));
    
    form.setFieldsValue({ options: newOptions });
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

    const option = options[index];
    if (option.id) {
      setDeletedOptionIds(prev => [...prev, option.id]);
    }

    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    const newImgState = {};
    newOptions.forEach((op, i) => {
      newImgState[i] = imageState[i < index ? i : i + 1];
    });
    setImageState(newImgState);
    
    form.setFieldsValue({ options: newOptions });
    setActiveTab(Math.max(0, index - 1).toString());

    const newErrors = { ...optionErrors };
    delete newErrors[index];
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

  // Delete an existing image
  const deleteExistingImage = (optionIndex, img) => {
    setImageState(prev => ({
      ...prev,
      [optionIndex]: {
        ...prev[optionIndex],
        existingImages: prev[optionIndex].existingImages.filter(i => i.id !== img.id),
        deletedImageIds: [...prev[optionIndex].deletedImageIds, img.id]
      }
    }));
  };

  const handleSubmit = () => {
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

      // ensure each option has at least one image (existing or new)
      // const optionHasImages = values.options.every((opt, idx) => {
      //   const imgState = imageState[idx];
      //   return (imgState?.existingImages?.length > 0 || imgState?.newImages?.length > 0) || 
      //          (opt.images && opt.images.length > 0);
      // });
      const optionHasImages = values.options.every((_, idx) => {
  const imgState = imageState[idx];
  return (
    (imgState?.existingImages?.length ?? 0) > 0 ||
    (imgState?.newImages?.length ?? 0) > 0
  );
});

      
      if (!optionHasImages) {
        const idx = values.options.findIndex((opt, index) => {
          const imgState = imageState[index];
          return !((imgState?.existingImages?.length > 0 || imgState?.newImages?.length > 0) || 
                   (opt.images && opt.images.length > 0));
        });
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
      const normalizedOptions = updatedOptions.map((opt, idx) => ({ 
        ...opt, 
        images: imageState[idx]?.existingImages || [],
        existingImageUrls: imageState[idx]?.existingImages?.map(img => img.url) || []
      }));
      
      onNext({ 
        options: normalizedOptions, 
        deletedOptionIds,
        imageState
      });
    }).catch(err => {
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
    return false;
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ options }} onFinish={handleSubmit}>
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
                  {`Phiên bản ${index + 1}${option.id ? ` (ID: ${option.id})` : ''}`}
                  {optionErrors[index] && <Tag color="red" style={{ marginLeft: 8 }}>Lỗi</Tag>}
                </span>
              }
              key={index.toString()}
              closable={options.length > 1}
            >
              <div style={{ padding: '0 16px' }}>
                {option.id && (
                  <Form.Item name={['options', index, 'id']} hidden>
                    <Input />
                  </Form.Item>
                )}
                
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
                {/* Existing images display */}
                {/* {imageState[index]?.existingImages?.length > 0 && (
                  <Row gutter={16} style={{ marginBottom: 12 }}>
                    {imageState[index].existingImages.map((img) => (
                      <Col key={img.id} span={6} style={{ position: 'relative' }}>
                        <Image
                          src={img.url}
                          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }}
                          preview={false}
                        />
                        <Button
                          danger
                          type="primary"
                          shape="circle"
                          icon={<DeleteOutlined />}
                          size="small"
                          style={{ position: 'absolute', top: 4, right: 4 }}
                          onClick={() => deleteExistingImage(index, img)}
                        />
                      </Col>
                    ))}
                  </Row>
                )} */}

                <Form.Item
                  name={['options', index, 'images']}
                  label="Ảnh của phiên bản (gallery)"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    const fileList = Array.isArray(e) ? e : (e && e.fileList || []);
                    // Separate new images from existing
                    const newImgs = fileList.filter(f => !f.isExisting && (f.originFileObj || f.uid?.startsWith('rc-upload')));
                    setImageState(prev => ({
                      ...prev,
                      [index]: {
                        ...prev[index] || { existingImages: [], newImages: [], deletedImageIds: [] },
                        newImages: newImgs
                      }
                    }));
                    return fileList;
                  }}
                  
                  rules={[
                    {
                      validator: () => {
                        const hasExisting = (imageState[index]?.existingImages?.length ?? 0) > 0;
                        const hasNew = (imageState[index]?.newImages?.length ?? 0) > 0;
                        return hasExisting || hasNew
                          ? Promise.resolve()
                          : Promise.reject(new Error('Vui lòng tải lên ít nhất 1 ảnh'));
                      }
                    }
                  ]}

                >
                  <Upload
                    listType="picture-card"
                    multiple
                    beforeUpload={beforeUploadOptionImage}
                    accept="image/*"
                    // do not set fileList here, let Form.Item manage it
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



// Step 3: Product Variants
const VariantsStep = ({ form, onNext, onBack, initialValues, deletedVariantIds, setDeletedVariantIds, deletedOptionIds }) => {
  const [activeTab, setActiveTab] = useState('0');
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState({});
  const [colorErrors, setColorErrors] = useState({});
  const notification = useContext(NotificationContext);

  // Cập nhật options từ initialValues, lọc bỏ options bị đánh dấu xóa
  useEffect(() => {
    if (initialValues.options && initialValues.options.length > 0) {
      // Lọc bỏ các option đã bị đánh dấu xóa
      const activeOptions = initialValues.options.filter(option => 
        !Array.isArray(deletedOptionIds) || !deletedOptionIds.includes(option.id)
      );
      setOptions(activeOptions);
    }
  }, [initialValues.options, deletedOptionIds]);

  // Khởi tạo variants từ options
  useEffect(() => {
    if (options.length > 0) {
      const initialVariants = { ...variants };
      
      // Xóa bỏ các variants của options đã bị xóa hoặc options không còn tồn tại
      Object.keys(initialVariants).forEach(optionIndex => {
        if (parseInt(optionIndex) >= options.length) {
          delete initialVariants[optionIndex];
        }
      });
      
      // Tạo hoặc cập nhật variants cho từng option còn lại
      options.forEach((option, index) => {
        if (!initialVariants[index]) {
          // Nếu option có sẵn variants từ backend
          if (option.productVariants && option.productVariants.length > 0) {
            initialVariants[index] = option.productVariants.map(variant => ({
              id: variant.id,
              color: variant.color,
              priceDiff: variant.priceDiff,
              stock: variant.stock,
              imageUrl: variant.imageUrl,
              // Nếu có hình ảnh, tạo đối tượng hiển thị
              ...(variant.imageUrl && {
                image: [{
                  uid: `existing-variant-${variant.id}`,
                  name: `variant-${variant.id}.jpg`,
                  status: 'done',
                  url: variant.imageUrl,
                  thumbUrl: variant.imageUrl,
                  isExisting: true
                }]
              })
            }));
          } else {
            initialVariants[index] = [{ color: '', priceDiff: 0, stock: 1 }];
          }
        }
      });
      
      setVariants(initialVariants);
      form.setFieldsValue({ variants: initialVariants });
    }
  }, [options, form]);

  const addVariant = (optionIndex) => {
    const newVariants = { ...variants };
    if (!newVariants[optionIndex]) {
      newVariants[optionIndex] = [];
    }
    newVariants[optionIndex] = [...newVariants[optionIndex], { color: '', priceDiff: 0, stock: 1 }];
    setVariants(newVariants);
    form.setFieldsValue({ variants: newVariants });
  };

// Trong VariantsStep component
const removeVariant = (optionIndex, variantIndex) => {
  if (!variants[optionIndex] || variants[optionIndex].length <= 1) {
    notification.error({
      message: 'Lỗi',
      description: 'Cần có ít nhất một màu sắc',
      placement: 'topRight',
    });
    return;
  }

  // Kiểm tra nếu variant đã tồn tại trong DB (có ID), thêm vào danh sách xóa
  const variantToRemove = variants[optionIndex][variantIndex];
  if (variantToRemove && variantToRemove.id) {
    // Thêm vào danh sách variant bị xóa cho option này
    const optionId = options[optionIndex].id;
    if (optionId) {
      // Tạo bản sao của deletedVariantIds hiện tại
      const updatedDeletedVariantIds = { ...deletedVariantIds };
      
      // Đảm bảo có mảng cho optionId này
      if (!updatedDeletedVariantIds[optionId]) {
        updatedDeletedVariantIds[optionId] = [];
      }
      
      // Thêm variantId vào mảng
      updatedDeletedVariantIds[optionId].push(variantToRemove.id);
      
      // Log trước khi cập nhật state
      console.log('Cập nhật deletedVariantIds:', updatedDeletedVariantIds);
      
      // Cập nhật state
      setDeletedVariantIds(updatedDeletedVariantIds);
      
      // Hiển thị thông báo thành công
      notification.success({
        message: 'Thành công',
        description: `Đã đánh dấu màu ${variantToRemove.color} để xóa`,
        placement: 'topRight',
      });
    }
  }

  // Cập nhật lại UI
  const newVariants = { ...variants };
  // Sử dụng slice để tạo mảng mới thay vì filter để tránh lỗi
  newVariants[optionIndex] = [
    ...newVariants[optionIndex].slice(0, variantIndex),
    ...newVariants[optionIndex].slice(variantIndex + 1)
  ];
  setVariants(newVariants);
  form.setFieldsValue({ variants: newVariants });
  
  // Kiểm tra lại màu sắc sau khi xóa
  validateColorsForOption(optionIndex, newVariants);
};

  // Validate colors cho một option cụ thể
  const validateColorsForOption = (optionIndex, currentVariants = variants) => {
    const optionVariants = currentVariants[optionIndex] || [];
    const colors = optionVariants.map(v => v.color?.trim().toLowerCase()).filter(Boolean);
    
    // Check for duplicate colors
    const uniqueColors = new Set(colors);
    if (uniqueColors.size !== colors.length && colors.length > 0) {
      const duplicateColors = colors.filter((color, index) => 
        colors.indexOf(color) !== index
      );
      
      const errorMsg = `Màu "${duplicateColors[0]}" bị trùng lặp trong phiên bản "${options[optionIndex]?.code || ''}". Mỗi màu sắc phải có màu khác nhau.`;
      setColorErrors(prev => ({...prev, [optionIndex]: errorMsg}));
      return false;
    } else {
      setColorErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[optionIndex];
        return newErrors;
      });
      return true;
    }
  };

  // Validate colors for all options
  const validateColors = () => {
    let isValid = true;
    Object.keys(variants).forEach(optionIndex => {
      if (!validateColorsForOption(optionIndex)) {
        isValid = false;
      }
    });
    return isValid;
  };

  // Hàm xử lý khi người dùng thay đổi màu sắc
  const handleColorChange = (optionIndex, variantIndex, value) => {
    const newVariants = { ...variants };
    newVariants[optionIndex][variantIndex].color = value;
    setVariants(newVariants);
    
    // Kiểm tra trùng lặp màu sắc ngay khi người dùng nhập
    validateColorsForOption(optionIndex, newVariants);
  };

  const handleImageChange = (optionIndex, variantIndex, info) => {
    const newVariants = { ...variants };
    newVariants[optionIndex][variantIndex].image = info.fileList.length > 0 ? info.fileList : undefined;
    setVariants(newVariants);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.error({
        message: 'Lỗi',
        description: 'Chỉ được tải lên hình ảnh!',
        placement: 'topRight',
      });
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      notification.error({
        message: 'Lỗi',
        description: 'Hình ảnh phải nhỏ hơn 5MB!',
        placement: 'topRight',
      });
    }
    return false; // Prevent auto upload
  };

  const handleSubmit = () => {
    // Chắc chắn rằng tất cả variants đã được khởi tạo cho mỗi option
    const allOptionsHaveVariants = options.every((_, optionIndex) => 
      variants[optionIndex] && variants[optionIndex].length > 0
    );

    if (!allOptionsHaveVariants) {
      const missingOptionIndex = options.findIndex((_, optionIndex) => 
        !variants[optionIndex] || variants[optionIndex].length === 0
      );

      notification.error({
        message: 'Lỗi',
        description: `Phiên bản "${options[missingOptionIndex]?.code || `#${missingOptionIndex}`}" chưa có màu sắc nào. Vui lòng thêm màu sắc cho tất cả phiên bản.`,
        placement: 'topRight',
      });
      setActiveTab(missingOptionIndex + '');
      return;
    }

    // Validate toàn bộ dữ liệu form
    form.validateFields().then(values => {
      // Kiểm tra xem tất cả các option có ít nhất một variant với đầy đủ thông tin không
      const allVariantsValid = options.every((option, optionIndex) => {
        const optionVariants = variants[optionIndex] || [];
        
        return optionVariants.length > 0 && optionVariants.every(variant => 
          variant.color && variant.stock && (variant.image || (variant.id && variant.imageUrl))
        );
      });

      if (!allVariantsValid) {
        const invalidOptionIndex = options.findIndex((option, optionIndex) => {
          const optionVariants = variants[optionIndex] || [];
          
          return optionVariants.length === 0 || optionVariants.some(variant => 
            !variant.color || !variant.stock || (!variant.image && !(variant.id && variant.imageUrl))
          );
        });
        notification.error({
          message: 'Lỗi',
          description: `Phiên bản "${options[invalidOptionIndex]?.code || `#${invalidOptionIndex + 1}`}" có màu sắc chưa đủ thông tin. Vui lòng kiểm tra lại.`,
          placement: 'topRight',
        });
        setActiveTab(invalidOptionIndex + '');
        return;
      }

      // Validate colors are unique within each option
      if (!validateColors()) {
        const errorOptionIndex = Object.keys(colorErrors)[0];
        if (errorOptionIndex) {
          setActiveTab(errorOptionIndex);
        }
        return;
      }
      
      // Tất cả dữ liệu hợp lệ, tiếp tục bước tiếp theo
      onNext({ 
        variants: form.getFieldValue('variants'),
        deletedVariantIds: deletedVariantIds,
        deletedOptionIds: deletedOptionIds
      });
    }).catch(error => {
      console.error('Validation failed:', error);
      if (error.errorFields && error.errorFields.length > 0) {
        const errorField = error.errorFields[0].name;
        if (errorField.length > 1 && errorField[0] === 'variants') {
          const errorOptionIndex = errorField[1];
          setActiveTab(errorOptionIndex + '');
          notification.error({
            message: 'Lỗi',
            description: `Phiên bản ${parseInt(errorOptionIndex) + 1} có lỗi. Vui lòng kiểm tra lại.`,
            placement: 'topRight',
          });
        }
      }
    });
  };

  // Xử lý nút Quay lại
  const handleBackClick = () => {
    const currentVariants = form.getFieldValue('variants');
    if (currentVariants) {
      onBack({ 
        variants: currentVariants,
        deletedVariantIds: deletedVariantIds,
        deletedOptionIds: Array.isArray(deletedOptionIds) ? deletedOptionIds : []
      });
    } else {
      onBack({
        deletedOptionIds: Array.isArray(deletedOptionIds) ? deletedOptionIds : []
      });
    }
  };

  if (!options || options.length === 0) {
    return (
      <Card bordered={false}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>Vui lòng thêm ít nhất một phiên bản sản phẩm trước khi thêm màu sắc.</p>
          <Button type="primary" onClick={handleBackClick} style={{ marginTop: 16 }}>
            <ArrowLeftOutlined /> Quay lại Phiên bản
          </Button>
        </div>
      </Card>
    );
  }

  // Hiển thị tổng số variant bị xóa
  const totalDeletedVariants = Object.values(deletedVariantIds || {}).reduce((acc, variantIds) => acc + variantIds.length, 0);

  return (
    <Form form={form} layout="vertical">
      <Card title="Màu sắc sản phẩm" bordered={false}>
        {Object.keys(colorErrors).length > 0 && (
          <Alert
            message="Cảnh báo"
            description="Có lỗi trùng màu sắc trong một số phiên bản. Vui lòng kiểm tra và sửa lỗi trước khi tiếp tục."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {totalDeletedVariants > 0 && (
          <Alert
            message={`Đã đánh dấu ${totalDeletedVariants} màu sắc để xóa`}
            description="Các màu sắc này sẽ bị xóa khi bạn lưu thay đổi."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {options.map((option, optionIndex) => (
            <TabPane 
              tab={
                <span>
                  {`Phiên bản ${optionIndex + 1}: ${option.code || 'Chưa đặt tên'}`}
                  {colorErrors[optionIndex] && <Tag color="red" style={{ marginLeft: 8 }}>Lỗi</Tag>}
                </span>
              } 
              key={optionIndex + ''}
            >
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="dashed" 
                  onClick={() => addVariant(optionIndex)}
                  icon={<PlusOutlined />}
                >
                  Thêm màu sắc
                </Button>
              </div>

              {colorErrors[optionIndex] && (
                <div style={{ 
                  color: '#ff4d4f', 
                  marginBottom: 16,
                  padding: '8px 12px', 
                  background: '#fff2f0', 
                  border: '1px solid #ffccc7',
                  borderRadius: '4px'
                }}>
                  {colorErrors[optionIndex]}
                </div>
              )}

              {variants[optionIndex] && variants[optionIndex].map((variant, variantIndex) => (
                <Card
                  key={variantIndex}
                  title={`Màu sắc ${variantIndex + 1}${variant.id ? ` (ID: ${variant.id})` : ''}`}
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => removeVariant(optionIndex, variantIndex)}
                      disabled={(variants[optionIndex] || []).length <= 1}
                    />
                  }
                >
                  <Form.Item
                    name={['variants', optionIndex, variantIndex, 'id']}
                    hidden
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name={['variants', optionIndex, variantIndex, 'color']}
                    label="Màu sắc"
                    rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }]}
                  >
                    <Input 
                      placeholder="VD: Đen, Bạc" 
                      onChange={(e) => handleColorChange(optionIndex, variantIndex, e.target.value)}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={['variants', optionIndex, variantIndex, 'priceDiff']}
                        label="Chênh lệch giá"
                      >
                        <Input type="number" placeholder="0.00" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={['variants', optionIndex, variantIndex, 'stock']}
                        label="Số lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                      >
                        <Input type="number" placeholder="0" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name={['variants', optionIndex, variantIndex, 'image']}
                    label="Hình ảnh màu sắc"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e.fileList}
                    rules={[{ 
                      required: !variant.id || !variant.imageUrl, 
                      message: 'Vui lòng tải lên hình ảnh màu sắc!' 
                    }]}
                  >
                    <Upload 
                      listType="picture-card" 
                      maxCount={1}
                      beforeUpload={beforeUpload}
                      onChange={(info) => handleImageChange(optionIndex, variantIndex, info)}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    </Upload>
                  </Form.Item>

                  {variant.id && variant.imageUrl && !variant.image && (
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center' }}>
                      <Tag color="blue">Hình ảnh hiện tại</Tag>
                      <Image 
                        src={variant.imageUrl} 
                        width={100} 
                        height={100} 
                        style={{ objectFit: 'cover', marginLeft: 8 }}
                        alt={`Màu ${variant.color}`}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </TabPane>
          ))}
        </Tabs>
      </Card>
      
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={handleBackClick}>
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



const ReviewStep = ({ formData, onSubmit, onBack }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const notification = useContext(NotificationContext);
  const navigate = useNavigate();


  const handleSubmit = async () => {
    setLoading(true);

    try {
      const fd = new FormData();

      // -------- BASIC INFO --------
      fd.append("id", formData.productId);
      fd.append("name", formData.basicInfo.name);
      fd.append("description", formData.basicInfo.description || "");
      fd.append("categoryId", formData.basicInfo.categoryId);
      fd.append("brandId", formData.basicInfo.brandId);

      // ✨ Deleted Options
      if (formData.deletedOptionIds?.length > 0) {
        formData.deletedOptionIds.forEach(id => {
          fd.append("deletedOptionIds", id);
        });
      }


      const activeOptions = formData.options.filter(
        opt => !formData.deletedOptionIds.includes(opt.id)
      );

      activeOptions.forEach((option, optionIndex) => {
        const optionKey = `options[${optionIndex}]`;

        if (option.id) fd.append(`${optionKey}.id`, option.id);

        fd.append(`${optionKey}.code`, option.code);
        fd.append(`${optionKey}.price`, option.price);

        // Technical specifications
        const specFields = [
          "cpu", "gpu", "ram", "ramType", "ramSlot", "storage", "storageUpgrade",
          "displaySize", "displayResolution", "displayRefreshRate", "displayTechnology",
          "audioFeatures", "keyboard", "security", "webcam", "os",
          "battery", "weight", "dimension", "wifi", "bluetooth", "ports", "specialFeatures"
        ];

        specFields.forEach(field => {
          fd.append(`${optionKey}.${field}`, option[field] || "");
        });

        // IMAGE HANDLING - imageState is keyed by active option index
        const imgState = formData.imageState?.[optionIndex];
        
        // DELETED IMAGE IDS - must be sent before new images
        if (imgState?.deletedImageIds?.length > 0) {
          imgState.deletedImageIds.forEach(id => {
            fd.append(`${optionKey}.deletedImageIds`, id);
          });
        }

        // NEW IMAGES (files) - backend will add these to existing collection
        if (imgState?.newImages?.length > 0) {
          imgState.newImages.forEach(img => {
            if (img.originFileObj) {
              fd.append(`${optionKey}.images`, img.originFileObj);
            }
          });
        }
        


        // VARIANTS
        const variants = formData.variants[optionIndex] || [];

        // Deleted Variants
        if (formData.deletedVariantIds?.[option.id]?.length > 0) {
          formData.deletedVariantIds[option.id].forEach(vid => {
            fd.append(`${optionKey}.deletedVariantIds`, vid);
          });
        }

        variants.forEach((variant, vIndex) => {
          const vKey = `${optionKey}.variants[${vIndex}]`;

          if (variant.id) fd.append(`${vKey}.id`, variant.id);

          fd.append(`${vKey}.color`, variant.color);
          fd.append(`${vKey}.priceDiff`, variant.priceDiff || 0);
          fd.append(`${vKey}.stock`, variant.stock || 0);

          // NEW variant image
          if (variant.image?.[0]?.originFileObj) {
            fd.append(`${vKey}.image`, variant.image[0].originFileObj);
          }
        });
      });

      // CALL API
      const result = await dispatch(adminUpdateProduct(formData.productId, fd));

      if (result === 200) {
        notification.success({
          message: "Cập nhật thành công",
          placement: "topRight",
        });

        onSubmit();

        setTimeout(() => navigate("/admin/laptops"), 800);
      } else {
        notification.error({
          message: "Lỗi",
          description: "Không thể cập nhật sản phẩm!",
        });
      }

    } catch (err) {
      console.error(err);
      notification.error({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật!",
      });

    } finally {
      setLoading(false);
    }
  };


  const activeOptions = formData.options.filter(
    opt => !formData.deletedOptionIds.includes(opt.id)
  );

  return (
    <div>
      <Card title="Xem lại thông tin sản phẩm" bordered={false}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="ID">{formData.productId}</Descriptions.Item>
          <Descriptions.Item label="Tên">{formData.basicInfo.name}</Descriptions.Item>

          <Descriptions.Item label="Danh mục">
            {formData.basicInfo.categoryName || formData.basicInfo.categoryId}
          </Descriptions.Item>
          <Descriptions.Item label="Thương hiệu">
            {formData.basicInfo.brandName || formData.basicInfo.brandId}
          </Descriptions.Item>

          <Descriptions.Item label="Mô tả" span={2}>
            <div dangerouslySetInnerHTML={{ __html: formData.basicInfo.description || "Không có mô tả" }} />
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {formData.deletedOptionIds.length > 0 && (
          <Alert
            type="warning"
            showIcon
            message={`${formData.deletedOptionIds.length} phiên bản sẽ bị xoá`}
            style={{ marginBottom: 16 }}
          />
        )}

        <Collapse>
          {activeOptions.map((opt, index) => {
            const hasDeletedVar =
              formData.deletedVariantIds?.[opt.id]?.length > 0;

            return (
              <Panel
                key={index}
                header={`Phiên bản ${index + 1}: ${opt.code}`}
                extra={opt.id && <Tag color="blue">ID: {opt.id}</Tag>}
              >
                <Divider orientation="left">Hình ảnh (Gallery)</Divider>

                <Row gutter={16}>
                  {/* Existing images */}
                  {formData.imageState?.[index]?.existingImages?.map(img => (
                    <Col span={6} key={img.id}>
                      <Image src={img.url} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                    </Col>
                  ))}

                  {/* New images preview */}
                  {formData.imageState?.[index]?.newImages?.map((img, i) => (
                    <Col span={6} key={`new-${i}`}>
                      <Image
                        src={URL.createObjectURL(img.originFileObj)}
                        style={{ width: "100%", height: 120, objectFit: "cover" }}
                      />
                    </Col>
                  ))}
                </Row>

                <Divider orientation="left">Thông tin kỹ thuật</Divider>

                <Descriptions bordered column={2}>
                  <Descriptions.Item label="CPU">{opt.cpu}</Descriptions.Item>
                  <Descriptions.Item label="GPU">{opt.gpu}</Descriptions.Item>
                  <Descriptions.Item label="RAM">{opt.ram}</Descriptions.Item>
                  <Descriptions.Item label="Loại RAM">{opt.ramType}</Descriptions.Item>
                  <Descriptions.Item label="Khe RAM">{opt.ramSlot}</Descriptions.Item>
                  <Descriptions.Item label="Lưu trữ">{opt.storage}</Descriptions.Item>
                  <Descriptions.Item label="Nâng cấp">{opt.storageUpgrade}</Descriptions.Item>
                  <Descriptions.Item label="Màn hình">{opt.displaySize}</Descriptions.Item>
                  <Descriptions.Item label="Độ phân giải">{opt.displayResolution}</Descriptions.Item>
                  <Descriptions.Item label="Tần số quét">{opt.displayRefreshRate}</Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Màu sắc</Divider>

                {hasDeletedVar && (
                  <Alert
                    type="warning"
                    message={`${formData.deletedVariantIds[opt.id].length} màu sắc sẽ bị xoá`}
                    showIcon
                    style={{ marginBottom: 12 }}
                  />
                )}

                <Row gutter={16}>
                  {(formData.variants[index] || []).map(variant => {
                    // Skip deleted variants
                    if (
                      opt.id &&
                      formData.deletedVariantIds?.[opt.id]?.includes(variant.id)
                    ) {
                      return null;
                    }

                    return (
                      <Col span={8} key={variant.color}>
                        <Card title={variant.color}>
                          {variant.image?.[0] ? (
                            <Avatar
                              shape="square"
                              size={70}
                              src={
                                variant.image[0].url ||
                                variant.image[0].thumbUrl ||
                                URL.createObjectURL(variant.image[0].originFileObj)
                              }
                            />
                          ) : (
                            variant.imageUrl && (
                              <Avatar shape="square" size={70} src={variant.imageUrl} />
                            )
                          )}

                          <p><b>Số lượng:</b> {variant.stock}</p>
                          {variant.priceDiff !== 0 && (
                            <p><b>Chênh lệch giá:</b> {variant.priceDiff}</p>
                          )}
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Panel>
            );
          })}
        </Collapse>
      </Card>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        <Space>
          <Button onClick={onBack}>
            <ArrowLeftOutlined /> Quay lại
          </Button>
          <Button type="primary" loading={loading} onClick={handleSubmit} icon={<CheckOutlined />}>
            Cập nhật
          </Button>
        </Space>
      </div>
    </div>
  );
};



const UpdateProductWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    productId: null,
    basicInfo: {},
    options: [],
    variants: {},
    deletedOptionIds: [],
    deletedVariantIds: {},
    imageState: {} // NEW
  });

  const { id } = useParams();
  const dispatch = useDispatch();
  const notification = useContext(NotificationContext);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();

  // Load product
  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (id) => {
    try {
      const data = await dispatch(adminDetailProduct(id));

      const basicInfo = {
        name: data.name,
        description: data.description,
        categoryId: data.category.id,
        categoryName: data.category.name,
        brandId: data.brand.id,
        brandName: data.brand.name
      };

      setFormData({
        productId: data.id,
        basicInfo,
        options: data.options || [],
        variants: {},
        deletedOptionIds: [],
        deletedVariantIds: {},
        imageState: {}
      });

      form1.setFieldsValue(basicInfo);

    } catch (err) {
      notification.error({ message: "Lỗi", description: "Không thể tải sản phẩm!" });
    }
  };

  // Update previews when switching steps
  useEffect(() => {
    if (currentStep === 0) form1.setFieldsValue(formData.basicInfo);
    if (currentStep === 1) form2.setFieldsValue({ options: formData.options });
    if (currentStep === 2) form3.setFieldsValue({ variants: formData.variants });
  }, [currentStep]);

  // Step Next
  const handleNext = (stepIndex, data) => {
    if (stepIndex === 0) {
      setFormData(prev => ({ ...prev, basicInfo: data }));
    }
    if (stepIndex === 1) {
      setFormData(prev => ({
        ...prev,
        options: data.options,
        deletedOptionIds: data.deletedOptionIds,
        imageState: data.imageState
      }));
    }
    if (stepIndex === 2) {
      setFormData(prev => ({
        ...prev,
        variants: data.variants,
        deletedVariantIds: data.deletedVariantIds,
        deletedOptionIds: data.deletedOptionIds
      }));
    }

    setCurrentStep(stepIndex + 1);
  };

  // Step Back
  const handleBack = (stepIndex, data) => {
    if (stepIndex === 2) {
      setFormData(prev => ({
        ...prev,
        options: data?.options || prev.options,
        deletedOptionIds: data?.deletedOptionIds || prev.deletedOptionIds
      }));
    }

    if (stepIndex === 3) {
      setFormData(prev => ({
        ...prev,
        variants: data?.variants || prev.variants,
        deletedVariantIds: data?.deletedVariantIds || prev.deletedVariantIds
      }));
    }

    setCurrentStep(stepIndex - 1);
  };

  const steps = [
    {
      title: "Thông tin cơ bản",
      content: (
        <BasicInfoStep
          form={form1}
          initialValues={formData.basicInfo}
          onNext={(data) => handleNext(0, data)}
        />
      )
    },
    {
      title: "Phiên bản",
      content: (
        <OptionsStep
          form={form2}
          initialValues={formData}
          deletedOptionIds={formData.deletedOptionIds}
          setDeletedOptionIds={(ids) => setFormData(prev => ({ ...prev, deletedOptionIds: ids }))}
          onBack={() => handleBack(1)}
          onNext={(data) => handleNext(1, data)}
        />
      )
    },
    {
      title: "Màu sắc",
      content: (
        <VariantsStep
          form={form3}
          initialValues={{
            ...formData,
            options: formData.options.filter(
              o => !formData.deletedOptionIds.includes(o.id)
            )
          }}
          deletedOptionIds={formData.deletedOptionIds}
          deletedVariantIds={formData.deletedVariantIds}
          setDeletedVariantIds={(ids) => {
            setFormData(prev => ({ ...prev, deletedVariantIds: ids }));
          }}
          onNext={(data) => handleNext(2, data)}
          onBack={(data) => handleBack(2, data)}
        />
      )
    },
    {
      title: "Xem lại",
      content: (
        <ReviewStep
          formData={formData}
          onBack={() => handleBack(3)}
          onSubmit={() => {
            form1.resetFields();
            form2.resetFields();
            form3.resetFields();
          }}
        />
      )
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Steps current={currentStep} style={{ marginBottom: 20 }}>
        {steps.map((s, i) => (
          <Step key={i} title={s.title} />
        ))}
      </Steps>

      <div>{steps[currentStep].content}</div>
    </div>
  );
};


// Main Page Component
const UpdateProduct = () => {
  const { id } = useParams();
  
  if (!id) {
    return (
      <div style={{ padding: 24 }}>
        <Alert 
          message="Lỗi"
          description="Không tìm thấy ID sản phẩm. Vui lòng quay lại danh sách sản phẩm và chọn sản phẩm cần cập nhật."
          type="error"
          showIcon
        />
      </div>
    );
  }
  
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Cập nhật sản phẩm #{id}</h1>
      <UpdateProductWizard />
    </div>
  );
};

export default UpdateProduct;



