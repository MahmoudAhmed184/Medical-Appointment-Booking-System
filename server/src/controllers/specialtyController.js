import Specialty from "../models/Specialty.js";
import Doctor from "../models/Doctor.js";

const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: specialties.length,
      data: specialties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSpecialtyById = async (req, res) => {
  try {
    const { id } = req.params;

    const specialty = await Specialty.findById(id);
    if (!specialty)
      return res.status(404).json({
        success: false,
        message: "Specialty not found",
      });

    res.status(200).json({
      success: true,
      data: specialty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --- Admin-only ---

const createSpecialty = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await Specialty.findOne({ name });
    if (existing)
      return res.status(400).json({
        success: false,
        message: "Specialty already exists",
      });

    const specialty = await Specialty.create({ name, description });

    res.status(201).json({
      success: true,
      data: specialty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const specialty = await Specialty.findById(id);
    if (!specialty)
      return res.status(404).json({
        success: false,
        message: "Specialty not found",
      });

    if (name) specialty.name = name;
    if (description !== undefined) specialty.description = description;

    await specialty.save();

    res.status(200).json({
      success: true,
      data: specialty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;

    const specialty = await Specialty.findById(id);
    if (!specialty)
      return res.status(404).json({
        success: false,
        message: "Specialty not found",
      });

    const doctorsUsingIt = await Doctor.countDocuments({ specialtyId: id });
    if (doctorsUsingIt > 0)
      return res.status(400).json({
        success: false,
        message: "Cannot delete specialty assigned to doctors",
      });

    await specialty.deleteOne();

    res.status(200).json({
      success: true,
      message: "Specialty deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getAllSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
};
