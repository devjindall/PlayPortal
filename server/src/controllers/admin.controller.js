import * as adminService from '../services/admin.service.js';

/**
 * GET /api/admin/submissions
 * Get submissions list
 */
export const getSubmissions = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await adminService.getSubmissions({ status, page, limit });

    res.status(200).json({
      success: true,
      data: result.submissions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/submissions/:id
 * Get single submission
 */
export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await adminService.getSubmissionById(req.params.id);

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * PATCH /api/admin/submissions/:id/approve
 * Approve submission and publish game
 */
export const approveSubmission = async (req, res, next) => {
  try {
    const result = await adminService.approveSubmission({
      submissionId: req.params.id,
      adminId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Game submission approved and game published successfully',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * PATCH /api/admin/submissions/:id/reject
 * Reject submission with reason
 */
export const rejectSubmission = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const result = await adminService.rejectSubmission({
      submissionId: req.params.id,
      adminId: req.user._id,
      rejectionReason,
    });

    res.status(200).json({
      success: true,
      message: 'Game submission rejected',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * GET /api/admin/users
 * List all users
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, page, limit } = req.query;
    const result = await adminService.getUsers({ search, role, page, limit });

    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Toggle user active/inactive status
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const updatedUser = await adminService.toggleUserStatus({
      userId: req.params.id,
      isActive,
      currentAdminId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
