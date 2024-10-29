import React, { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Modal,
  IconButton,
} from "@mui/material";
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

import { FaEdit, FaTrashAlt, FaPlus, FaChartBar } from "react-icons/fa";
import { YouTube as YouTubeIcon, Image as ImageIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// Simulated data
const initialTasks = [
  {
    id: 1,
    name: "Tarea de Matemáticas",
    description: "Resolver problemas del capítulo 5",
    dueDate: "2023-06-15",
    completedBy: [1, 3],
    materials: [
      { type: "video", url: "https://www.youtube.com/watch?v=ymG01zCW1Iw", title: "Explicación de álgebra" },
      { type: "image", url: "https://example.com/math-formulas.jpg", title: "Fórmulas importantes" },
    ],
  },
  {
    id: 2,
    name: "Proyecto de Ciencias",
    description: "Investigación sobre energías renovables",
    dueDate: "2023-06-20",
    completedBy: [2],
    materials: [
      { type: "image", url: "https://example.com/renewable-energy.jpg", title: "Infografía de energías renovables" },
    ],
  },
];

const users = [
  { id: 1, name: "Ana García", role: "student" },
  { id: 2, name: "Carlos Rodríguez", role: "student" },
  { id: 3, name: "María López", role: "student" },
  { id: 4, name: "Juan Martínez", role: "student" },
  { id: 5, name: "Prof. Pérez", role: "teacher" },
];

function TeacherDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState("table");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [openMaterial, setOpenMaterial] = useState(null);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenDialog = (task = null) => {
    setCurrentTask(task);
    setOpenDialog(true);
    setErrors({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTask(null);
  };

  const handleSaveTask = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTask = {
      id: currentTask ? currentTask.id : tasks.length + 1,
      name: formData.get("name"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
      completedBy: currentTask ? currentTask.completedBy : [],
      materials: currentTask ? currentTask.materials : [],
    };

    const videoUrl = formData.get("videoUrl");
    const imageUrl = formData.get("imageUrl");

    if (videoUrl) {
      newTask.materials.push({ type: "video", url: videoUrl, title: "Video de apoyo" });
    }
    if (imageUrl) {
      newTask.materials.push({ type: "image", url: imageUrl, title: "Imagen de apoyo" });
    }

    if (!newTask.name || !newTask.description || !newTask.dueDate) {
      setMessage("Por favor, completa todos los campos obligatorios.");
      setOpenSnackbar(true);
      setErrors({
        name: "Este campo es obligatorio.",
        description: "Este campo es obligatorio.",
        dueDate: "Este campo es obligatorio.",
      });
      return;
    }

    if (currentTask) {
      setTasks(tasks.map((task) => (task.id === currentTask.id ? newTask : task)));
    } else {
      setTasks([...tasks, newTask]);
    }
    setSuccessMessage("Tarea guardada exitosamente.");
    handleCloseDialog();
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    setOpenDeleteConfirm(false);
    setSuccessMessage("Tarea eliminada exitosamente.");
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "dueDate") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return (
      b.completedBy.length / users.filter((u) => u.role === "student").length -
      a.completedBy.length / users.filter((u) => u.role === "student").length
    );
  });

  const filteredTasks = sortedTasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.materials.some((material) => material.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCompletionPercentage = (task) => {
    const totalStudents = users.filter((u) => u.role === "student").length;
    return (task.completedBy.length / totalStudents) * 100;
  };

  const handleOpenMaterial = (material) => {
    setOpenMaterial(material);
  };

  const handleCloseMaterial = () => {
    setOpenMaterial(null);
  };

  const handleOpenDeleteConfirm = (task) => {
    setCurrentTask(task);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setCurrentTask(null);
  };

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
            <MenuItem value="progress">Progreso</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Button
            variant={view === "table" ? "contained" : "outlined"}
            onClick={() => setView("table")}
            startIcon={<FaChartBar />}
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
                        <TableCell>{task.name}</TableCell>
                        <TableCell>{task.description}</TableCell>
                        <TableCell>{task.dueDate}</TableCell>
                        <TableCell>
                          <LinearProgress variant="determinate" value={getCompletionPercentage(task)} />
                          <Typography variant="body2">{`${task.completedBy.length} de ${
                            users.filter((u) => u.role === "student").length
                          } (${getCompletionPercentage(task).toFixed(1)}%)`}</Typography>
                        </TableCell>
                        <TableCell>
                          {task.materials.map((material, index) => (
                            <IconButton key={index} onClick={() => handleOpenMaterial(material)}>
                              {material.type === "video" ? <YouTubeIcon /> : <ImageIcon />}
                            </IconButton>
                          ))}
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
                            onClick={() => handleOpenDeleteConfirm(task)}
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
                <BarChart data={filteredTasks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={(task) => getCompletionPercentage(task)} name="Estudiantes Completados (%)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>

      {/* Success Message Modal */}
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
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-white text-2xl font-bold mb-4">{successMessage}</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              defaultValue={currentTask?.name || ""}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              margin="dense"
              name="description"
              label="Descripción"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentTask?.description || ""}
              error={!!errors.description}
              helperText={errors.description}
            />
            <TextField
              margin="dense"
              name="dueDate"
              label="Fecha de Entrega"
              type="date"
              fullWidth
              variant="outlined"
              defaultValue={currentTask?.dueDate || ""}
              InputLabelProps={{ shrink: true }}
              error={!!errors.dueDate}
              helperText={errors.dueDate}
            />
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

      {/* Confirm Delete Modal */}
      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>¿Estás seguro de eliminar esta tarea?</DialogTitle>
        <DialogContent>Esta acción no se puede deshacer.</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button onClick={() => handleDeleteTask(currentTask?.id)} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={!!openMaterial} onClose={handleCloseMaterial}>
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
          <IconButton
            aria-label="close"
            onClick={handleCloseMaterial}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <FaTrashAlt />
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
            <img src={openMaterial?.url} alt={openMaterial?.title} style={{ width: "100%" }} />
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
