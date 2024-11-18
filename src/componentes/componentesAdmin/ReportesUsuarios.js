import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { FaUsers, FaUserPlus, FaUserFriends } from 'react-icons/fa';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportesUsuarios = () => {
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [nuevosUsuarios, setNuevosUsuarios] = useState(0);
  const [usuariosPorRoles, setUsuariosPorRoles] = useState([]);
  const [crecimientoUsuarios, setCrecimientoUsuarios] = useState([]);
  const [coordinadores, setCoordinadores] = useState(0);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef(); // Ref para el PDF

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        // Obtener total de usuarios
        const totalUsuariosRes = await axios.get('http://localhost:5000/userReports/totalUsuarios');
        setTotalUsuarios(totalUsuariosRes.data.total);  // Asegúrate de que "total" sea la clave correcta

        // Obtener crecimiento de usuarios a lo largo del tiempo
        const crecimientoUsuariosRes = await axios.get('http://localhost:5000/userReports/crecimientoUsuarios');
        console.log('Datos de crecimiento de usuarios:', crecimientoUsuariosRes.data);
        setCrecimientoUsuarios(crecimientoUsuariosRes.data);

        // Obtener distribución por roles
        const rolesRes = await axios.get('http://localhost:5000/userReports/usuariosPorRoles');
        setUsuariosPorRoles(rolesRes.data);

        // Extraer la cantidad de coordinadores
        const coordinadores = rolesRes.data.find(role => role.name === 'Coordinador')?.value || 0;
        setCoordinadores(coordinadores);

        // Obtener nuevos usuarios en la última semana
        const nuevosUsuariosRes = await axios.get('http://localhost:5000/userReports/nuevosUsuarios');
        setNuevosUsuarios(nuevosUsuariosRes.data);

      } catch (error) {
        console.error('Error al obtener datos de usuarios:', error);
      }
    };

    fetchData();

    // Actualizar los mensajes cada 5 segundos
    const intervalId = setInterval(fetchData, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);

  }, []);

  const formatMonth = (monthString) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [year, month] = monthString.split("-");
    return `${months[parseInt(month, 10) - 1]} ${year}`;
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
  
    // Título "Reporte de Usuarios"
    pdf.setFontSize(24); // Tamaño reducido
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(secondaryColor);
    pdf.text("Reporte de Usuarios", pageWidth / 2, 30, { align: "center" });
  
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
  
    pdf.text(`Total de Usuarios Registrados:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${totalUsuarios}`, 10, startY + 5); // Valor debajo
    startY += lineSpacing * 2;
  
    pdf.setFont("helvetica", "bold");
    pdf.text(`Nuevos Usuarios:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${nuevosUsuarios}`, 10, startY + 5); // Valor debajo
    startY += lineSpacing * 2;
  
    pdf.setFont("helvetica", "bold");
    pdf.text(`Total de Coordinadores:`, 10, startY);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${coordinadores}`, 10, startY + 5); // Valor debajo
    startY += lineSpacing * 3;
  
    // Distribución de Usuarios por Rol
    pdf.setFontSize(10); // Reducir tamaño de fuente para caber en una sola hoja
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(secondaryColor);
    pdf.text("Distribución de Usuarios por Rol:", 10, startY);
    startY += lineSpacing;
  
    // Tabla para distribución por roles
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(secondaryColor);
    pdf.setLineWidth(0.1);
    pdf.setDrawColor(secondaryColor);
  
    pdf.rect(10, startY, pageWidth - 20, 8); // Cabecera
    pdf.text("Rol", 15, startY + 6);
    pdf.text("Cantidad", pageWidth - 50, startY + 6);
    startY += 10;
  
    usuariosPorRoles.forEach((data, index) => {
      pdf.rect(10, startY, pageWidth - 20, 8); // Fila
      pdf.text(data.name, 15, startY + 6);
      pdf.text(`${data.value}`, pageWidth - 50, startY + 6);
      startY += 10;
  
      if (startY > 280) {
        // Si el contenido excede una hoja, detén la adición de más datos
        pdf.text("... Más datos omitidos", 10, startY + 6);
        return;
      }
    });
  
    // Guardar el PDF
    pdf.save("reporteUsuarios.pdf");
  };
  
  

  return (
    <div className="max-w-6xl mx-auto mt-2" ref={pdfRef}>
      {/* Título encima del contenido */}
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Reporte Usuarios
      </Typography>
      {/* Resumen rápido - Total de usuarios, nuevos usuarios, usuarios por rol */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#383D3B', color: '#EEE5E9', border: '1px solid #7C7C7C' }}>
            <CardContent>
              <div className="flex items-center">
                <FaUsers className="text-blue-400 mr-2" size={40} /> {/* Color original */}
                <div>
                  <Typography variant="h4">{totalUsuarios || 0}</Typography>
                  <Typography variant="subtitle1">Total de Usuarios Registrados</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#383D3B', color: '#EEE5E9', border: '1px solid #7C7C7C' }}>
            <CardContent>
              <div className="flex items-center">
                <FaUserPlus className="text-green-400 mr-2" size={40} /> {/* Color original */}
                <div>
                  <Typography variant="h4">{nuevosUsuarios}</Typography>
                  <Typography variant="subtitle1">Nuevos Usuarios</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
  
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: '#383D3B', color: '#EEE5E9', border: '1px solid #7C7C7C' }}>
            <CardContent>
              <div className="flex items-center">
                <FaUserFriends className="text-purple-400 mr-2" size={40} /> {/* Color original */}
                <div>
                  <Typography variant="h4">{coordinadores || 0}</Typography>
                  <Typography variant="subtitle1">Coordinadores</Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
  
      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Gráfica de línea - Crecimiento de usuarios */}
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
            <FaUsers className="text-blue-400 mr-2" size={24} /> {/* Color original */}
            <Typography variant="h6" style={{ color: "#EEE5E9" }} gutterBottom>
              Crecimiento de Usuarios a lo largo del tiempo
            </Typography>
          </div>
          {crecimientoUsuarios.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={crecimientoUsuarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#7C7C7C" />
                <XAxis dataKey="month" stroke="#EEE5E9" tickFormatter={formatMonth} />
                <YAxis stroke="#EEE5E9" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#383D3B', color: '#EEE5E9', borderRadius: '10px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Usuarios"
                  stroke="#FFBB28" // Color original
                  activeDot={{ r: 8 }}
                  strokeWidth={3}
                  dot={{ stroke: '#FF8042', strokeWidth: 2 }} // Color original
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography style={{ color: "#EEE5E9" }}>Cargando datos de crecimiento...</Typography>
          )}
        </motion.div>
  
        {/* Gráfica de pastel - Distribución de roles */}
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
            <FaUserFriends className="text-green-400 mr-2" size={24} />
            <Typography variant="h6" style={{ color: "#EEE5E9" }} gutterBottom>
              Distribución de Usuarios por Rol
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usuariosPorRoles}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  totalUsuarios > 0
                    ? `${name}: ${(value / totalUsuarios * 100).toFixed(2)}%`
                    : `${name}: 0%`
                }
                outerRadius={120}
                fill="#8884d8" // Color original
                dataKey="value"
              >
                {usuariosPorRoles.map((entry, index) => (
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
        <button
          className="bg-92DCE5 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-7C7C7C"
          onClick={exportarPDF}
        >
          Exportar en PDF
        </button>
      </div>
    </div>
  );  
};

export default ReportesUsuarios;
