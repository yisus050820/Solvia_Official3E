import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Modal,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from "@mui/material";
import { FaEdit, FaTrashAlt, FaPlus, FaChartBar } from "react-icons/fa";
import { YouTube as YouTubeIcon, Image as ImageIcon } from "@mui/icons-material";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function TeacherDashboard({ programId }) {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("table");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [openMaterial, setOpenMaterial] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/taskVol/tasks/${programId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          fetch: "Error al cargar las tareas."
        }));
      }
    };

    fetchTasks();
  }, [programId]);

  const handleOpenDialog = (task = null) => {
    setCurrentTask(task);
    setOpenDialog(true);
    setErrors({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTask(null);
  };

  const handleSaveTask = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTask = {
      title: formData.get("name"),
      description: formData.get("description"),
      end_date: formData.get("dueDate"),
      image: formData.get("imageUrl"),
      video: formData.get("videoUrl"),
      id_program: programId
    };
  
    // Resetear errores
    setErrors({});
  
    // Validaciones
    let validationErrors = {};
  
    if (!newTask.title || newTask.title.length < 5) {
      validationErrors.name = "El título es obligatorio y debe tener al menos 5 caracteres.";
    }
    if (!newTask.description || newTask.description.length < 10) {
      validationErrors.description = "La descripción es obligatoria y debe tener al menos 10 caracteres.";
    }
    if (!newTask.end_date) {
      validationErrors.dueDate = "La fecha de entrega es obligatoria.";
    } else {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (new Date(newTask.end_date) < todayDate) {
        validationErrors.dueDate = "La fecha de entrega no puede ser anterior a la fecha actual.";
      }
    }
  
    // Si hay errores, actualizamos el estado y salimos de la función
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      if (currentTask) {
        await axios.put(`http://localhost:5000/taskVol/tasks/${currentTask.id}`, newTask, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post("http://localhost:5000/taskVol/tasks", newTask, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
  
      const response = await axios.get(`http://localhost:5000/taskVol/tasks/${programId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTasks(response.data);
      handleCloseDialog();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al guardar la tarea.";
      setErrors((prevErrors) => ({
        ...prevErrors,
        saveTask: errorMessage
      }));
    }
  };  

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/taskVol/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        deleteTask: "Error al eliminar la tarea."
      }));
    }
  };

  const handleOpenMaterial = (material) => {
    if (material.type === "video" && material.url.includes("youtube.com/watch?v=")) {
      let videoId = material.url.split("v=")[1];
      const ampersandPosition = videoId.indexOf("&");
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      setOpenMaterial({ ...material, url: embedUrl });
    } else {
      setOpenMaterial(material);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "name") return a.title.localeCompare(b.title);
    if (sortBy === "dueDate") return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
    return 0;
  });

  const filteredTasks = sortedTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompletionPercentage = (task) => {
    if (!task.total || task.total === 0) return 0;  
    return (task.completed / task.total) * 100;  
  };

  const chartData = tasks.map(task => ({
    name: task.title,
    completionPercentage: getCompletionPercentage(task),
  }));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Buscar..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="sort-select-label">Ordenar por</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label="Ordenar por"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="name">Nombre</MenuItem>
            <MenuItem value="dueDate">Fecha de entrega</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Button
            variant={view === "table" ? "contained" : "outlined"}
            onClick={() => setView("table")}
            startIcon={<FaEdit />}
          >
            Tabla
          </Button>
          <Button
            variant={view === "chart" ? "contained" : "outlined"}
            onClick={() => setView("chart")}
            startIcon={<FaChartBar />}
          >
            Gráfico
          </Button>
          <motion.button
            className="bg-green-500 text-white p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleOpenDialog()}
          >
            <FaPlus />
          </motion.button>
        </Box>

        <AnimatePresence mode="wait">
          {view === "table" ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre de la Tarea</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Fecha de Entrega</TableCell>
                      <TableCell>Estudiantes Completados</TableCell>
                      <TableCell>Materiales</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.end_date}</TableCell>
                        <TableCell>
                          <LinearProgress variant="determinate" value={getCompletionPercentage(task)} />
                          <Typography variant="body2">
                            {`${getCompletionPercentage(task).toFixed(1)}%`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {task.image && (
                            <IconButton onClick={() => handleOpenMaterial({ type: "image", url: task.image })}>
                              <ImageIcon />
                            </IconButton>
                          )}
                          {task.video && (
                            <IconButton onClick={() => handleOpenMaterial({ type: "video", url: task.video })}>
                              <YouTubeIcon />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <motion.button
                            className="bg-blue-500 text-white p-2 rounded-full"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleOpenDialog(task)}
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button
                            className="bg-red-500 text-white p-2 rounded-full"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <FaTrashAlt />
                          </motion.button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completionPercentage" name="Porcentaje Completado (%)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      <Modal open={openDialog} onClose={handleCloseDialog}>
      <Box
        component="form"
        onSubmit={handleSaveTask}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <DialogTitle>{currentTask ? "Editar Tarea" : "Añadir Tarea"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre de la Tarea"
            type="text"
            fullWidth
            variant="outlined"
            defaultValue={currentTask?.title || ""}
            error={!!errors.name}
          />
          {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}

          <TextField
            margin="dense"
            name="description"
            label="Descripción"
            type="text"
            fullWidth
            variant="outlined"
            defaultValue={currentTask?.description || ""}
            error={!!errors.description}
          />
          {errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}

          <TextField
            margin="dense"
            name="dueDate"
            label="Fecha de Entrega"
            type="date"
            fullWidth
            variant="outlined"
            defaultValue={currentTask?.end_date || ""}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dueDate}
          />
          {errors.dueDate && <span style={{ color: 'red' }}>{errors.dueDate}</span>}

          <TextField
            margin="dense"
            name="videoUrl"
            label="URL del Video"
            type="url"
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            name="imageUrl"
            label="URL de la Imagen"
            type="url"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Modal>

      <Modal open={!!openMaterial} onClose={() => setOpenMaterial(null)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          {openMaterial?.type === "video" ? (
            <iframe
              width="100%"
              height="400"
              src={openMaterial.url}
              title="Material de apoyo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img src={openMaterial?.url} alt="Material de apoyo" style={{ width: "100%" }} />
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default TeacherDashboard;
