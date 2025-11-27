// import React, { useEffect, useState } from "react";
// // import { priceTagIcon } from "../../config/images";
// import priceTagIcon from "@/app/assets/Images/price-tag.webp"
// // import { Col, Row } from "react-bootstrap";
// import Select from "../FormElements/SelectElem/Select";
// import "react-datetime/css/react-datetime.css";
// import Datetime from "react-datetime";
// import "./index.css";
// import {
//   deadlineInHours,
//   formatDateWithTime,
//   getCalculatorServices,
//   getServiceOptions,
//   getTomorrowDate,
// } from "./helper";
// import { useNavigate } from "react-router-dom";
// import CalculatorLayout from "../Layouts/CalculatorLayout";
// import { useAuthContext } from "../../contexts/auth/AuthContext";
// import moment from "moment";
// import Spinner from "../Spinner/Spinner";
// import axios from "axios";
// import Image from "next/image";

// function PriceCalculator(props) {
//   const { dispatch } = useAuthContext();
//   const navigate = useNavigate();
//   const EducationLevelOptions = [
//     { label: "Graduate", value: "Graduate" },
//     { label: "Undergraduate", value: "Undergraduate" },
//   ];
//   const [servicesNames, setServicesNames] = useState([]);
//   const [services, setServices] = useState(null);

//   const [activeService, setActiveService] = useState("");
//   const [isGraduate, setIsGraduate] = useState(false);
//   const [price, setPrice] = useState(0);
//   const [selectedServiceId, setSelectedServiceId] = useState(null);
//   const [qty, setQty] = useState(1);
//   const [date, setDate] = useState(moment(new Date()).add(3, "day"));
//   const [dateErr, setDateErr] = useState(null);
//   const [qtyTitle, setQtyTitle] = useState("Quantity");
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     getPackages();
//   }, []);

//   const getPackages = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/package`);

//       const { names, withOptions } = getCalculatorServices(res.data);

//       setServicesNames(names);
//       setServices(withOptions);
//       setActiveService(names[0]);
//       setSelectedServiceId(withOptions[names[0]].options[0].packageId);
//       setIsLoading(false);
//     } catch (error) {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!activeService) return;
//     setSelectedServiceId(services[activeService].options[0].packageId);
//   }, [activeService]);
//   useEffect(() => {
//     if (!selectedServiceId) return;
//     let price = null;
//     let option = services[activeService].options.find(
//       (o) => o.packageId === selectedServiceId
//     );

//     if (isGraduate) {
//       price = option.graduate_fee;
//     } else {
//       price = option.undergraduate_fee;
//     }

//     if (deadlineInHours(date) <= 48) {
//       price = emergencyPrice(price, deadlineInHours(date));
//       setPrice(price * qty);
//     } else {
//       setPrice(price * qty);
//     }
//     updateQtyTitle(option);
//     dispatch({
//       type: "UPDATE_ORDER",
//       payload: {
//         service: activeService,
//         type: option.name,
//         isGraduate,
//         qty,
//         fee: price * qty,
//         packageId: isGraduate
//           ? option.graduate_package_id
//           : option.undergraduate_package_id,
//         date: formatDateWithTime(date),
//       },
//     });
//   }, [isGraduate, qty, date, selectedServiceId]);

//   const emergencyPrice = (p, deadline) => {
//     if (activeService === "class") return p;
//     // increasing 20% price
//     if (deadline <= 24) return p + p * 0.2;

//     // increasing 10% price
//     return p + p * 0.1;
//   };

//   const updateQtyTitle = (option) => {
//     if (option.name === "All Writing Assignments (Per Page/275 words)") {
//       return setQtyTitle("Per Page");
//     } else if (option.name === "Powerpoint Presentation (Per Slide)") {
//       return setQtyTitle("Per Slide");
//     } else {
//       return setQtyTitle("Quantity");
//     }
//   };

//   const isValidDate = (current) => {
//     const today = new Date().setHours(0, 0, 0, 0); // Get today's date without time
//     const selectedDate = current.startOf("day").valueOf(); // Get selected date without time

//     return selectedDate >= today; // Only allow dates equal to or greater than today
//   };

//   const placeMyOrder = () => {
//     if (!date) return setDateErr("Please select date");
//     // if (!user.name) return navigate("/login?return_url=checkout");

//     navigate("/checkout");
//   };

//   return (
//     <CalculatorLayout>
//       <div className="text-center"></div>
//       <div className="row">
//         <div className="col-12 price-calculator">
//           <div className="h3 calculator-title">Calculate the Price</div>
//           {isLoading ? (
//             <div className="text-center">
//               <Spinner />
//             </div>
//           ) : (
//             <>
//               <div className="lead input-title">Service</div>
//               <div className="btns-container">
//                 {servicesNames?.map((s) => (
//                   <button
//                     className={`primary-btn me-2 mt-1 text-capitalize ${
//                       s === activeService ? "selected-service" : ""
//                     }`}
//                     onClick={() => setActiveService(s)}
//                     key={s}
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//               <Select
//                 title="Education Level"
//                 options={EducationLevelOptions}
//                 handleChange={(val) => {
//                   setIsGraduate(() => val === "Graduate");
//                 }}
//                 selectedOption="Undergraduate"
//               />
//               <div>
//                 {activeService && (
//                   <Select
//                     title="Type"
//                     options={getServiceOptions(services[activeService])}
//                     handleChange={(e) => {
//                       setSelectedServiceId(e);
//                     }}
//                     selectedOption={selectedServiceId}
//                   />
//                 )}
//               </div>

//               <Row>
//                 <Col xs={12} md={8}>
//                   <div className="lead input-title">Deadline</div>
//                   <div className="d-flex align-items-center input-container">
//                     <div className="w-100">
//                       <div>
//                         <Datetime
//                           className="date-time-picker"
//                           isValidDate={isValidDate}
//                           // value={formatDateWithTime(new Date())}
//                           inputProps={{
//                             placeholder: "Select a date and time",
//                             value: date
//                               ? formatDateWithTime(date) + " EST"
//                               : getTomorrowDate() + " EST",
//                           }}
//                           onChange={(v) => {
//                             setDate(v);
//                             setDateErr(null);
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-danger">{dateErr && dateErr}</div>
//                 </Col>
//                 <Col xs={12} md={4}>
//                   <div className="lead input-title">{qtyTitle}</div>
//                   <div className="d-flex align-items-center input-container">
//                     <div className="d-flex justify-content-between w-100 px-2">
//                       <div
//                         className="p decrement"
//                         onClick={() =>
//                           setQty((prev) => (prev === 1 ? 1 : prev - 1))
//                         }
//                       >
//                         -
//                       </div>
//                       <div className="p">{qty}</div>
//                       <div
//                         className="p increment"
//                         onClick={() => setQty((prev) => prev + 1)}
//                       >
//                         +
//                       </div>
//                     </div>
//                   </div>
//                 </Col>
//               </Row>

//               <Row
//                 style={{
//                   marginTop: "24px",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <Col xs={8} lg={8}>
//                   {/* <Link
//                             to={user?.name ? "/checkout" : "/login"}
//                             style={{ textDecoration: "none" }}
//                         > */}
//                   <button
//                     className="primary-btn w-100 calculate-task"
//                     onClick={placeMyOrder}
//                   >
//                     Place my order
//                   </button>
//                   {/* </Link> */}
//                 </Col>
//                 <Col xs={3} lg={3}>
//                   <div className="d-flex align-items-center justify-content-center justify-content-center justify-content-lg-end price-container">
//                     <span className="price p mr-2">${price}</span>{" "}
//                     <Image
//                       src={priceTagIcon}
//                       alt="price tag"
//                       style={{
//                         height: "40px",
//                         width: "40px",
//                         marginLeft: "8px",
//                       }}
//                     />
//                   </div>
//                 </Col>
//               </Row>
//             </>
//           )}
//         </div>
//       </div>
//     </CalculatorLayout>
//   );
// }

// export default PriceCalculator;
