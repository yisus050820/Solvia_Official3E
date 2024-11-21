import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid, Button, Snackbar } from '@mui/material';
import { FaDollarSign, FaMoneyBillWave, FaChartPie } from 'react-icons/fa';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportesDonaciones = () => {
  const [totalDonaciones, setTotalDonaciones] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [promedioPorUsuario, setPromedioPorUsuario] = useState(0);
  const [donacionesPorDonante, setDonacionesPorDonante] = useState([]);
  const [evolucionDonaciones, setEvolucionDonaciones] = useState([]);
  const pdfRef = useRef();
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const totalDonacionesRes = await axios.get('http://localhost:5000/donationsReports/totalDonaciones');
        setTotalDonaciones(totalDonacionesRes.data);

        const totalGastosRes = await axios.get('http://localhost:5000/donationsReports/totalGastos');
        setTotalGastos(totalGastosRes.data);

        const donacionesPorDonanteRes = await axios.get('http://localhost:5000/donationsReports/distribucionDonaciones');
        console.log('Datos de donaciones por donante:', donacionesPorDonanteRes.data);
        setDonacionesPorDonante(donacionesPorDonanteRes.data);

        const totalUsuarios = donacionesPorDonanteRes.data.length;
        const totalDonaciones = donacionesPorDonanteRes.data.reduce((acc, donor) => acc + donor.total_donations, 0);
        setPromedioPorUsuario(totalDonaciones / totalUsuarios);

        const evolucionRes = await axios.get('http://localhost:5000/donationsReports/evolucionDonaciones');
        console.log('Datos de la evolucion;', evolucionRes.data)
        setEvolucionDonaciones(evolucionRes.data);
      } catch (error) {
        console.error('Error fetching donation data:', error);
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

  const handleLogout = () => {
    localStorage.clear(); 
    delete axios.defaults.headers.common['Authorization']; 
    window.location.href = '/index'; 
  };

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

    // Título "Reporte de Donaciones"
    pdf.setFontSize(24); // Tamaño reducido
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(secondaryColor);
    pdf.text("Reporte de Donaciones", pageWidth / 2, 30, { align: "center" });

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

    pdf.text(`Total de Donaciones:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`$${totalDonaciones.toFixed(2)}`, 10, startY + 5); // Monto debajo
    startY += lineSpacing * 2;

    pdf.setFont("helvetica", "bold");
    pdf.text(`Total de Gastos:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`$${totalGastos.toFixed(2)}`, 10, startY + 5); // Monto debajo
    startY += lineSpacing * 2;

    pdf.setFont("helvetica", "bold");
    pdf.text(`Promedio de Donaciones por Usuario:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`$${promedioPorUsuario.toFixed(2)}`, 10, startY + 5); // Monto debajo
    startY += lineSpacing * 3;

    // Tablas y datos
    pdf.setFontSize(10); // Reducir tamaño de fuente para caber en una sola hoja
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(secondaryColor);
    pdf.text("Evolución de Donaciones:", 10, startY);
    startY += lineSpacing;

    pdf.setFont("helvetica", "normal");
    evolucionDonaciones.forEach((data, index) => {
      pdf.text(`${data.month}`, 10, startY);
      pdf.text(`$${data.Donaciones}`, 60, startY);
      startY += lineSpacing;
    });

    startY += lineSpacing;
    pdf.setFont("helvetica", "bold");
    pdf.text("Distribución de Donaciones por Donante:", 10, startY);
    startY += lineSpacing;

    // Tabla para distribución por donantes
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(secondaryColor);
    pdf.setLineWidth(0.1);
    pdf.setDrawColor(secondaryColor);

    pdf.rect(10, startY, pageWidth - 20, 8); // Cabecera
    pdf.text("Donante", 15, startY + 6);
    pdf.text("Monto", pageWidth - 50, startY + 6);
    startY += 10;

    donacionesPorDonante.forEach((data, index) => {
      pdf.rect(10, startY, pageWidth - 20, 8); // Fila
      pdf.text(data.donor_name, 15, startY + 6);
      pdf.text(`$${data.total_donations}`, pageWidth - 50, startY + 6);
      startY += 10;

      if (startY > 280) {
        // Si el contenido excede una hoja, detén la adición de más datos
        pdf.text("... Más datos omitidos", 10, startY + 6);
        return;
      }
    });

    // Guardar el PDF
    pdf.save("reporteDonaciones.pdf");
  };


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto mt-2">
                      {/* Botón de cerrar sesión */}
                      <button
        onClick={handleLogout}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff0000', // Rojo brillante
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
        }}
      >
        Cerrar sesión
      </button>
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Reporte Donaciones
      </Typography>

      {error && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={error}
        />
      )}

      <div ref={pdfRef}>
        {/* Tarjetas de métricas */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#383D3B', color: '#FFFFFF', border: '1px solid #3A3B3F' }}>
              <CardContent>
                <div className="flex items-center">
                  <FaDollarSign className="text-green-400 mr-2" size={40} />
                  <div>
                    <Typography variant="h4">${totalDonaciones}</Typography>
                    <Typography variant="subtitle1">Total de Donaciones</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#383D3B', color: '#FFFFFF', border: '1px solid #3A3B3F' }}>
              <CardContent>
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-blue-400 mr-2" size={40} />
                  <div>
                    <Typography variant="h4">${totalGastos}</Typography>
                    <Typography variant="subtitle1">Total de Gastos</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: '#383D3B', color: '#FFFFFF', border: '1px solid #3A3B3F' }}>
              <CardContent>
                <div className="flex items-center">
                  <FaChartPie className="text-yellow-400 mr-2" size={40} />
                  <div>
                    <Typography variant="h4">${promedioPorUsuario.toFixed(2)}</Typography>
                    <Typography variant="subtitle1">Promedio de Donaciones por Usuario</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gráficas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <motion.div
            className="p-6 rounded-lg shadow-lg"
            style={{
              backgroundColor: '#383D3B',
              color: '#FFFFFF',
              border: '1px solid #3A3B3F',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-4">
              <FaDollarSign className="text-green-400 mr-2" size={24} />
              <Typography variant="h6" gutterBottom>
                Evolución de Donaciones
              </Typography>
            </div>
            {evolucionDonaciones.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucionDonaciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3A3B3F" />
                  <XAxis dataKey="month" stroke="#FFFFFF" />
                  <YAxis stroke="#FFFFFF" />
                  <Tooltip contentStyle={{ backgroundColor: '#2C2F33', color: '#FFFFFF', borderRadius: '10px' }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Donaciones"
                    stroke="#FFC107"
                    activeDot={{ r: 8 }}
                    strokeWidth={3}
                    dot={{ stroke: '#FF5722', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography>Cargando datos de evolución...</Typography>
            )}
          </motion.div>

          <motion.div
            className="p-6 rounded-lg shadow-lg"
            style={{
              backgroundColor: '#383D3B',
              color: '#FFFFFF',
              border: '1px solid #3A3B3F',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-4">
              <FaChartPie className="text-yellow-400 mr-2" size={24} />
              <Typography variant="h6" gutterBottom>
                Distribución de Donaciones
              </Typography>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={donacionesPorDonante}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ donor_name }) => {
                    // Mostrar solo el nombre del donante
                    const name = typeof donor_name === 'string' && donor_name.trim() ? donor_name : 'Anónimo';
                    return name;
                  }}
                  outerRadius={120}
                  dataKey="total_donations" // Clave de datos para la cantidad
                >
                  {donacionesPorDonante.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, entry) => {
                    const donorName = entry.payload.donor_name || 'Anónimo';
                    return [`$${value}`, `${donorName}`];
                  }}
                  contentStyle={{ backgroundColor: 'white', color: 'black', borderRadius: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      {/* Botón para exportar PDF */}
      <div className="flex justify-center mt-4">
        <Button variant="contained" sx={{ backgroundColor: '#007BFF', color: '#FFFFFF' }} onClick={exportarPDF}>
          Exportar a PDF
        </Button>
      </div>
    </div>
  );
};

export default ReportesDonaciones;
