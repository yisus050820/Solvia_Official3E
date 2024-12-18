import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  CardMedia,
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
  Snackbar,
  Alert,
  Modal,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Dialog,
  DialogContentText
} from "@mui/material";
import { FaEdit, FaTrashAlt, FaPlus, FaChartBar, FaCheck } from "react-icons/fa";
import { YouTube as YouTubeIcon, Image as ImageIcon, Close as CloseIcon, CheckCircle as CheckCircleIcon, } from "@mui/icons-material";
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
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito;
  const [atBottom, setAtBottom] = useState(true);
  const taskContainerRef = useRef(null);

  const handleScroll = () => {
    const taskContainer = taskContainerRef.current;
    if (taskContainer) {
      setAtBottom(
        Math.ceil(taskContainer.scrollTop + taskContainer.clientHeight) >= taskContainer.scrollHeight
      );
    }
  };

  useEffect(() => {
    const taskContainer = taskContainerRef.current;
    if (taskContainer && atBottom) {
      taskContainer.scrollTop = taskContainer.scrollHeight;
    }
  }, [tasks, atBottom]);

  const showErrorMessage = (errors) => {
    const firstError = Object.values(errors)[0];
    setMessage(firstError);
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
  };

  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1 },
  };

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 1000); // definir en cuanto tiempo desaparecera la alerta, se mide en ms (3 segundos)

    }
  }, [successMessage]);

  // Fetch tasks
  useEffect(() => {
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
        const errorMessage = error.response?.data?.message || "Error al cargar las tareas.";
        setMessage(errorMessage);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
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
      title: formData.get("name")?.trim(),
      description: formData.get("description")?.trim(),
      end_date: formData.get("dueDate"),
      image: formData.get("imageUrl"),
      video: formData.get("videoUrl"),
      id_program: programId,
    };
  
    const errors = {};
  
    // Validación de campos
    if (!newTask.title || newTask.title.length < 5) {
      errors.name = "El nombre de la tarea debe tener al menos 5 caracteres.";
    }
  
    if (!newTask.description || newTask.description.length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres.";
    }
  
    if (!newTask.end_date) {
      errors.dueDate = "La fecha de entrega es obligatoria.";
    } else {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (new Date(newTask.end_date) < todayDate) {
        errors.dueDate = "La fecha de entrega no puede ser anterior a hoy.";
      }
    }
  
    // Si hay errores, actualiza el estado y detén la ejecución
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
  
    try {
      if (currentTask) {
        await axios.put(`http://localhost:5000/taskVol/tasks/${currentTask.id}`, newTask, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await axios.post("http://localhost:5000/taskVol/tasks", newTask, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }
  
      const response = await axios.get(`http://localhost:5000/taskVol/tasks/${programId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      setTasks(response.data);
      handleCloseDialog();
      setErrors({}); // Limpia los errores después de guardar
      setSuccessMessage("Tarea guardada con éxito");
    } catch (error) {
      console.error("Error saving task:", error);
      const errorMessage = error.response?.data?.message || "Error al guardar la tarea.";
      setMessage(errorMessage);
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
      const errorMessage = error.response?.data?.message || "Error al eliminar la tarea.";
      setMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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

  const handleCloseMaterial = () => {
    setOpenMaterial(null);
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
    <Box sx={{ flexGrow: 1, backgroundColor: "#EEE5E9", minHeight: "100vh", overflow: "hidden", p: 3 }}>
      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#FFF", borderColor: "#7C7C7C", borderWidth: 1, borderStyle: "solid" }}>
        <TextField
          fullWidth
          label="Buscar..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FFF",
              "& fieldset": { borderColor: "#7C7C7C" },
              "&:hover fieldset": { borderColor: "#383D3B" },
              "&.Mui-focused fieldset": { borderColor: "#92DCE5" },
            },
          }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="sort-select-label" sx={{ color: "#383D3B" }}>Ordenar por</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label="Ordenar por"
            onChange={(e) => setSortBy(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FFF",
                "& fieldset": { borderColor: "#92DCE5" },
                "&:hover fieldset": { borderColor: "#383D3B" },
                "&.Mui-focused fieldset": { borderColor: "#92DCE5" },
              },
              "& .MuiSelect-select": {
                color: "#383D3B", // Cambia el color del texto seleccionado
              },
              "& .MuiMenuItem-root": {
                color: "#383D3B", // Cambia el color de las opciones del menú
              },
            }}
          >
            <MenuItem value="name" sx={{ color: '#92DCE5' }}>Nombre</MenuItem>
            <MenuItem value="dueDate" sx={{ color: '#92DCE5' }}>Fecha de entrega</MenuItem>

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
              style={{ overflow: "hidden" }}
            >
              <TableContainer component={Paper} sx={{ maxHeight: "none", overflow: "hidden" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#383D3B" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#EEE5E9" }}>Nombre de la Tarea</TableCell>
                      <TableCell sx={{ color: "#EEE5E9" }}>Descripción</TableCell>
                      <TableCell sx={{ color: "#EEE5E9" }}>Fecha de Entrega</TableCell>
                      <TableCell sx={{ color: "#EEE5E9" }}>Estudiantes Completados</TableCell>
                      <TableCell sx={{ color: "#EEE5E9" }}>Materiales</TableCell>
                      <TableCell sx={{ color: "#EEE5E9" }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.end_date}</TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={getCompletionPercentage(task)}
                            sx={{
                              backgroundColor: "#7C7C7C",
                              "& .MuiLinearProgress-bar": { backgroundColor: "#92DCE5" },
                            }}
                          />
                          <Typography variant="body2">{`${getCompletionPercentage(task).toFixed(1)}%`}</Typography>
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
                            onClick={() => {
                              setCurrentTask(task);
                              setIsDeleteConfirmOpen(true);
                            }}
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
              style={{ overflow: "hidden" }}
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#383D3B", // Fondo del tooltip
                      borderColor: "#92DCE5", // Color del borde
                    }}
                    itemStyle={{
                      color: "#EEE5E9", // Color del texto dentro del tooltip
                    }}
                    cursor={{ fill: "rgba(146, 220, 229, 0.2)" }} // Color del fondo hover en la gráfica
                  />
                  <Legend />
                  <Bar dataKey="completionPercentage" name="Porcentaje Completado (%)" fill="black" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
      {/* Modal para mensajes de éxito */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="p-6 rounded-xl shadow-lg"
              style={{
                backgroundColor: '#003f5c', // Fondo azul oscuro
                color: '#ffffff', // Texto blanco puro
              }}
            >
              <h2
                style={{
                  color: '#ffffff', // Texto blanco puro
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                {successMessage}
              </h2>
              <div className="flex justify-center items-center">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={checkmarkVariants}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="flex justify-center items-center"
                  style={{
                    borderRadius: '50%', // Hace que sea un círculo
                    backgroundColor: '#0097A7', // Aqua oscuro
                    width: '80px', // Tamaño del círculo
                    height: '80px', // Tamaño del círculo
                    display: 'flex', // Para alinear el contenido
                    justifyContent: 'center', // Centra horizontalmente
                    alignItems: 'center', // Centra verticalmente
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra suave
                  }}
                >
                  <FaCheck size={50} style={{ color: '#ffffff' }} /> {/* Palomita blanca */}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#383D3B', // Fondo oscuro
            color: '#EEE5E9', // Texto claro
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Estás seguro de eliminar esta tarea?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#EEE5E9' }}>
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <motion.button
            className="bg-[#7C7C7C] text-[#EEE5E9] px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDeleteConfirmOpen(false)} // Cierra el diálogo
          >
            Cancelar
          </motion.button>
          <motion.button
            className="bg-red-500 text-white px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={async () => {
              await handleDeleteTask(currentTask.id);
              setIsDeleteConfirmOpen(false);
              setSuccessMessage("Tarea eliminada con éxito"); // Mostrar mensaje de éxito
            }}
          >
            Eliminar
          </motion.button>
        </DialogActions>
      </Dialog>


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
              InputLabelProps={{
                style: { color: "#383D3B" },
              }}
            />
            {errors.name && (
              <span style={{ color: "red", fontSize: "0.9rem" }}>{errors.name}</span>
            )}

            <TextField
              margin="dense"
              name="description"
              label="Descripción"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentTask?.description || ""}
              error={!!errors.description}
              InputLabelProps={{
                style: { color: "#383D3B" },
              }}
            />
            {errors.description && (
              <span style={{ color: "red", fontSize: "0.9rem" }}>{errors.description}</span>
            )}

            <TextField
              margin="dense"
              name="dueDate"
              label="Fecha de Entrega"
              type="date"
              fullWidth
              variant="outlined"
              defaultValue={currentTask?.end_date || ""}
              InputLabelProps={{
                shrink: true,
                style: { color: "#383D3B" },
              }}
              error={!!errors.dueDate}
            />
            {errors.dueDate && (
              <span style={{ color: "red", fontSize: "0.9rem" }}>{errors.dueDate}</span>
            )}
            <TextField
              margin="dense"
              name="videoUrl"
              label="URL del Video"
              type="url"
              fullWidth
              variant="outlined"
              InputLabelProps={{
                style: { color: "#383D3B" }, // Color del label
              }}
            />
            <TextField
              margin="dense"
              name="imageUrl"
              label="URL de la Imagen"
              type="url"
              fullWidth
              variant="outlined"
              InputLabelProps={{
                style: { color: "#383D3B" }, // Color del label
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}
              sx={{
                color: "#FFFFFF", // Color del texto
                backgroundColor: "#FF6347", // Color de fondo
                "&:hover": {
                  backgroundColor: "#FF4500", // Color de fondo al pasar el mouse
                },
              }}
            >Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Box>
      </Modal>

      <Modal open={!!openMaterial} onClose={handleCloseMaterial}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseMaterial}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {openMaterial?.type === "video" ? (
            <iframe
              width="100%"
              height="400"
              src={openMaterial.url}
              title={openMaterial.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <CardMedia
              component="img"
              image={openMaterial?.url}
              alt={openMaterial?.title}
              sx={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
          <Typography variant="h6" component="h2" mt={2}>
            {openMaterial?.title}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}

export default TeacherDashboard;