import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Divider,
  Rate,
  Avatar,
  Space,
  Empty,
  Typography,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import InquiryButton from "./InquiryButton";
import { useAuthAction } from "../../hooks/useAuthAction";

import { RiMap2Fill } from "react-icons/ri";
import { endpoints } from "../../constant/ENDPOINTS";
import { apiClient } from "../../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Title, Paragraph } = Typography;

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuthAction();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const res = await apiClient.get(endpoints.GET_TOUR_DETAIL(id));
        const t = res.data;

        // Map API response to UI model
        const tourObj = {
          id: t.id,
          title: t.title,
          type: t.destination_details?.name || "Tour", // Adjusted based on likely serializer
          price: t.pricings?.[0]?.adult_price || 0,
          duration: t.duration || "N/A",
          image: t.image || "https://via.placeholder.com/800x400",
          description: t.description,
          rating: 4.5, // Mock rating if not in API
          reviews: t.reviews?.length || 0,
          location: t.destination_details?.name || "Unknown",
          groupSize: `${t.max_people || 10} people`,
          season: t.seasons?.[0]?.name || "Any",
          itinerary: (t.itineraries || []).map((it) => ({
            day: it.day_number,
            title: it.title || `Day ${it.day_number}`,
            description: it.description
          })),
          inclusions: t.inclusion_exclusion?.inclusion ? t.inclusion_exclusion.inclusion.split('\n') : [],
          exclusions: t.inclusion_exclusion?.exclusion ? t.inclusion_exclusion.exclusion.split('\n') : [],
          reviews_list: (t.reviews || []).map(r => ({
            id: r.id,
            author: r.user?.username || "Traveler",
            rating: r.rating,
            date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
            comment: r.comment
          }))
        };

        setTour(tourObj);
      } catch (err) {
        console.error("Failed to fetch tour detail", err);
        message.error("Failed to load tour details");
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id]);

  const handleDownloadPDF = async () => {
    const input = document.getElementById("tour-pdf-content");
    if (!input) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${tour?.title || "Tour"}_Brochure.pdf`);
      message.success("Brochure downloaded!");
    } catch (err) {
      console.error(err);
      message.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div >
        <Navbar />
        <div >Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!tour) {
    return (
      <div >
        <Navbar />
        <div ><Empty description="Tour not found" /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div >
      <Navbar />

      <div id="tour-pdf-content">
        {/* Hero Section */}
        <div  >
          <img src={tour.image} alt={tour.title} />
          <div >
            <div >
              <span >{tour.type}</span>
              <h1>{tour.title}</h1>
              <p><RiMap2Fill /> {tour.location}</p>
            </div>
          </div>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Card >
              <Row gutter={[16, 16]}>
                <Col span={6} ><CalendarOutlined /> <span>{tour.duration}</span></Col>
                <Col span={6} ><EnvironmentOutlined /> <span>{tour.groupSize}</span></Col>
                <Col span={6} ><UserOutlined /> <span>{tour.season}</span></Col>
                <Col span={6} ><span>⭐ {tour.rating} ({tour.reviews})</span></Col>
              </Row>
            </Card>

            <Tabs items={[
              {
                key: "itinerary",
                label: "Itinerary",
                children: (
                  <div >
                    {tour.itinerary.map((it, idx) => (
                      <div key={idx} >
                        <div >Day {it.day}</div>
                        <div >
                          <h4>{it.title}</h4>
                          <p>{it.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              },
              {
                key: "inclusions",
                label: "Inclusions & Exclusions",
                children: (
                  <Row gutter={16}>
                    <Col span={12}>
                      <h4>Inclusions</h4>
                      {tour.inclusions.map((inc, i) => (
                        <div key={i} >
                          <CheckCircleOutlined /> {inc}
                        </div>
                      ))}
                    </Col>
                    <Col span={12}>
                      <h4>Exclusions</h4>
                      {tour.exclusions.map((exc, i) => (
                        <div key={i} >
                          <CloseCircleOutlined style={{ color: "red" }} /> {exc}
                        </div>
                      ))}
                    </Col>
                  </Row>
                )
              },
              {
                key: "reviews",
                label: "Reviews",
                children: (
                  <div >
                    {tour.reviews_list.map(r => (
                      <Card key={r.id} style={{ marginBottom: 10 }}>
                        <Space>
                          <Avatar icon={<UserOutlined />} />
                          <div>
                            <strong>{r.author}</strong>
                            <Rate disabled value={r.rating} style={{ fontSize: 12, display: "block" }} />
                            <small>{r.date}</small>
                          </div>
                        </Space>
                        <p style={{ marginTop: 10 }}>{r.comment}</p>
                      </Card>
                    ))}
                  </div>
                )
              }
            ]} />
          </Col>

          <Col xs={24} lg={8}>
            <Card >
              <div >
                <p >Starting from</p>
                <h2 >₹{tour.price.toLocaleString()}</h2>
                <p >per person</p>
              </div>
              <Divider />
              <div >
                <div ><span>Duration:</span> <strong>{tour.duration}</strong></div>
                <div ><span>Group Size:</span> <strong>{tour.groupSize}</strong></div>
              </div>
              <Divider />
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button type="primary" block size="large" onClick={() => requireAuth(() => navigate(`/booking/${id}`), "book this tour")}>
                  Book Now
                </Button>
                <Button block onClick={() => navigate("/customize-tour")}>
                  Customize
                </Button>
                <Button block icon={<DownloadOutlined />} loading={isDownloading} onClick={handleDownloadPDF}>
                  Download Brochure
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      <InquiryButton />
      <Footer />
    </div>
  );
};

export default TourDetail;
