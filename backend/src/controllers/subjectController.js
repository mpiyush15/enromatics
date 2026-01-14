import Subject from '../models/Subject.js';

/**
 * Get all subjects for a tenant
 */
export const getAllSubjects = async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: 'Missing tenantId' });
    }

    const subjects = await Subject.find({ tenantId, status: 'active' }).sort({ name: 1 });
    return res.status(200).json({ data: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
};

/**
 * Create a new subject
 */
export const createSubject = async (req, res) => {
  try {
    const { tenantId, name, description } = req.body;

    if (!tenantId || !name) {
      return res.status(400).json({ message: 'Missing required fields: tenantId, name' });
    }

    // Check if subject already exists
    const existingSubject = await Subject.findOne({ tenantId, name: name.trim() });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = new Subject({
      tenantId,
      name: name.trim(),
      description: description || '',
      status: 'active',
    });

    await subject.save();
    console.log('✅ Subject created:', { subjectId: subject._id, name: subject.name });

    return res.status(201).json({ data: subject });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Error creating subject', error: error.message });
  }
};

/**
 * Update a subject
 */
export const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name, description, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;

    const subject = await Subject.findByIdAndUpdate(subjectId, updateData, { new: true });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log('✅ Subject updated:', subject._id);
    return res.status(200).json({ data: subject });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ message: 'Error updating subject', error: error.message });
  }
};

/**
 * Delete a subject
 */
export const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findByIdAndDelete(subjectId);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    console.log('✅ Subject deleted:', subjectId);
    return res.status(200).json({ data: subject });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Error deleting subject', error: error.message });
  }
};
