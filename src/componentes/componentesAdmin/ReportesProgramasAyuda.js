import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { FaHandsHelping, FaUserFriends, FaUsers, FaDollarSign, FaChartPie } from 'react-icons/fa';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB'];

const ReportesProgramasAyuda = () => {
  const [totalProgramas, setTotalProgramas] = useState(0);
  const [beneficiariosTotales, setBeneficiariosTotales] = useState(0);
  const [voluntariosTotales, setVoluntariosTotales] = useState(0);
  const [crecimientoProgramas, setCrecimientoProgramas] = useState([]);
  const [totalDonaciones, setTotalDonaciones] = useState([]);
  const [beneficiariosPorPrograma, setBeneficiariosPorPrograma] = useState([]);
  const pdfRef = useRef();
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtener datos desde el backend
  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Obtener total de programas
        const totalProgramasRes = await axios.get('http://localhost:5000/programReports/totalProgramas');
        setTotalProgramas(totalProgramasRes.data);

        // Obtener total de beneficiarios
        const totalBeneficiariosRes = await axios.get('http://localhost:5000/programReports/totalBeneficiarios');
        setBeneficiariosTotales(totalBeneficiariosRes.data);

        // Obtener total de voluntarios
        const totalVoluntariosRes = await axios.get('http://localhost:5000/programReports/totalVoluntarios');
        setVoluntariosTotales(totalVoluntariosRes.data);

        // Obtener crecimiento de programas
        const crecimientoProgramasRes = await axios.get('http://localhost:5000/programReports/crecimientoProgramas');
        console.log('Datos de crecimiento de programas:', crecimientoProgramasRes.data);
        setCrecimientoProgramas(crecimientoProgramasRes.data);

        // Obtener total de donaciones
        const totalDonacionesRes = await axios.get('http://localhost:5000/programReports/totalDonaciones');
        setTotalDonaciones(totalDonacionesRes.data);

        // Obtener beneficiarios por programa
        const beneficiariosPorProgramaRes = await axios.get('http://localhost:5000/programReports/beneficiariosPorPrograma');

        // Calcular el total de beneficiarios sumando todos los beneficiarios de los programas
        const totalBeneficiarios = beneficiariosPorProgramaRes.data.reduce(
          (acc, program) => acc + program.total_beneficiaries,
          0
        );

        setBeneficiariosTotales(totalBeneficiarios);
        setBeneficiariosPorPrograma(beneficiariosPorProgramaRes.data);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError('Hubo un error al obtener los datos de donaciones.');
        setSnackbarOpen(true);
      }
    };

    fetchData();

    // Actualizar los mensajes cada 5 segundos
    const intervalId = setInterval(fetchData, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);

  }, []);

  const exportarPDF = () => {
    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
  
    // Colores personalizados
    const primaryColor = "#007BFF"; // Azul corporativo
    const secondaryColor = "#444"; // Gris oscuro
  
    // Título "SOLVIA" como logo de empresa
    pdf.setFontSize(20); // Tamaño reducido
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primaryColor);
    pdf.text("SOLVIA", 10, 15);
  
    // Título "Reporte de Programas de Ayuda"
    pdf.setFontSize(24); // Tamaño reducido
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(secondaryColor);
    pdf.text("Reporte de Programas de Ayuda", pageWidth / 2, 30, { align: "center" });
  
    // Línea divisoria
    pdf.setLineWidth(0.8);
    pdf.setDrawColor(primaryColor);
    pdf.line(10, 35, pageWidth - 10, 35);
  
    // Datos del reporte
    pdf.setFontSize(12); // Tamaño reducido para compactar texto
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(secondaryColor);
  
    let startY = 40;
    const lineSpacing = 8;
  
    pdf.text(`Total de Programas Activos:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${totalProgramas}`, 10, startY + 5); // Valor debajo
    startY += lineSpacing * 2;
  
    pdf.setFont("helvetica", "bold");
    pdf.text(`Total de Beneficiarios Activos:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${beneficiariosTotales}`, 10, startY + 5); // Valor debajo
    startY += lineSpacing * 2;
  
    pdf.setFont("helvetica", "bold");
    pdf.text(`Total de Voluntarios Activos:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${voluntariosTotales}`, 10, startY + 5); // Valor debajo
    startY += lineSpacing * 3;
  
    // Tablas y datos
    pdf.setFontSize(10); // Reducir tamaño de fuente para caber en una sola hoja
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(secondaryColor);
    pdf.text("Crecimiento de Programas (por mes):", 10, startY);
    startY += lineSpacing;
  
    pdf.setFont("helvetica", "normal");
    crecimientoProgramas.forEach((data, index) => {
      pdf.text(`${data.month}`, 10, startY);
      pdf.text(`${data.Programas}`, 60, startY);
      startY += lineSpacing;
    });
  
    startY += lineSpacing;
    pdf.setFont("helvetica", "bold");
    pdf.text("Beneficiarios por Programa:", 10, startY);
    startY += lineSpacing;
  
    // Tabla para beneficiarios por programa
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(secondaryColor);
    pdf.setLineWidth(0.1);
    pdf.setDrawColor(secondaryColor);
  
    pdf.rect(10, startY, pageWidth - 20, 8); // Cabecera
    pdf.text("Programa", 15, startY + 6);
    pdf.text("Beneficiarios", pageWidth - 50, startY + 6);
    startY += 10;
  
    beneficiariosPorPrograma.forEach((data, index) => {
      pdf.rect(10, startY, pageWidth - 20, 8); // Fila
      pdf.text(data.program_name, 15, startY + 6);
      pdf.text(`${data.total_beneficiaries}`, pageWidth - 50, startY + 6);
      startY += 10;
  
      if (startY > 280) {
        // Si el contenido excede una hoja, detén la adición de más datos
        pdf.text("... Más datos omitidos", 10, startY + 6);
        return;
      }
    });
  
    // Guardar el PDF
    pdf.save("reporteProgramasAyuda.pdf");
  };
  
  

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto mt-2" ref={pdfRef}>
      {/* Título encima del contenido */}
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Reporte Programas
      </Typography>
      {/* Resumen rápido - Total de programas, beneficiarios, voluntarios */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#383D3B', color: '#EEE5E9', border: '1px solid #7C7C7C' }}>
            <CardContent>
              <div className="flex items-center">
                <FaHandsHelping className="text-red-500 mr-2" size={40} /> {/* Color original */}
                <div>
                  <Typography variant="h4">{totalProgramas}</Typography>
                  <Typography variant="subtitle1">Programas Activos</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
  
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#383D3B', color: '#EEE5E9', border: '1px solid #7C7C7C' }}>
            <CardContent>
              <div className="flex items-center">
                <FaUserFriends className="text-orange-500 mr-2" size={40} /> {/* Color original */}
                <div>
                  <Typography variant="h4">{beneficiariosTotales}</Typography>
                  <Typography variant="subtitle1">Beneficiarios Activos</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
  
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#383D3B', color: '#EEE5E9', border: '1px solid #7C7C7C' }}>
            <CardContent>
              <div className="flex items-center">
                <FaUsers className="text-yellow-500 mr-2" size={40} /> {/* Color original */}
                <div>
                  <Typography variant="h4">{voluntariosTotales}</Typography>
                  <Typography variant="subtitle1">Voluntarios Activos</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
  
      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Gráfica de línea - Crecimiento de programas */}
        <motion.div
          className="p-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: '#383D3B',
            color: '#EEE5E9',
            border: '1px solid #7C7C7C',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center mb-4">
            <FaDollarSign className="text-blue-500 mr-2" size={24} /> {/* Color original */}
            <Typography variant="h6" style={{ color: "#EEE5E9" }} gutterBottom>
              Programas impartidos por mes
            </Typography>
          </div>
          {crecimientoProgramas.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={crecimientoProgramas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7C7C7C" />
                <XAxis dataKey="month" stroke="#EEE5E9" />
                <YAxis stroke="#EEE5E9" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#383D3B', color: '#EEE5E9', borderRadius: '10px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Programas"
                  stroke="#FF5722" // Color original
                  activeDot={{ r: 8 }}
                  strokeWidth={3}
                  dot={{ stroke: '#FF7043', strokeWidth: 2 }} // Color original
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography style={{ color: "#EEE5E9" }}>Cargando datos de crecimiento...</Typography>
          )}
        </motion.div>
  
        {/* Gráfica de pastel - Proporción de beneficiarios por programa */}
        <motion.div
          className="p-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: '#383D3B',
            color: '#EEE5E9',
            border: '1px solid #7C7C7C',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center mb-4">
            <FaChartPie className="text-green-500 mr-2" size={24} /> 
            <Typography variant="h6" style={{ color: "#EEE5E9" }} gutterBottom>
              Proporción de Beneficiarios por Programa
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={beneficiariosPorPrograma}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8" // Color original
                dataKey="total_beneficiaries"
                nameKey="program_name"
                label={({ program_name }) =>
                  program_name.length > 10 ? `${program_name.slice(0, 10)}...` : program_name
                }
                labelLine={false} // Esto elimina las líneas blancas
              >
                {beneficiariosPorPrograma.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#383D3B', color: '#EEE5E9', borderRadius: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
  
      {/* Botón para exportar en PDF */}
      <div className="flex justify-center mt-8">
        <Button variant="contained" sx={{ backgroundColor: '#007BFF', color: '#FFFFFF' }} onClick={exportarPDF}>
          Exportar a PDF
        </Button>
      </div>
    </div>
  );  
};

export default ReportesProgramasAyuda;
