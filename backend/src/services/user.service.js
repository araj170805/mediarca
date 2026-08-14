const User = require('../models/user.model.js');
const ApiError = require('../utils/apiError.js');

class UserService {
  static async updateProfile(userId, updateData) {
    const allowedFields = ['name', 'phone'];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  static async addFamilyMember(userId, memberData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.familyMembers.push(memberData);
    await user.save();

    return user.familyMembers;
  }

  static async updateFamilyMember(userId, memberId, memberData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const member = user.familyMembers.id(memberId);
    if (!member) {
      throw new ApiError(404, 'Family member not found');
    }

    Object.assign(member, memberData);
    await user.save();

    return user.familyMembers;
  }

  static async deleteFamilyMember(userId, memberId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const member = user.familyMembers.id(memberId);
    if (!member) {
      throw new ApiError(404, 'Family member not found');
    }

    member.deleteOne();
    await user.save();

    return user.familyMembers;
  }

  // Admin User Management
  static async getAllUsers({ search, role, isBlocked, page = 1, limit = 10 }) {
    const query = { isDeleted: false };

    if (role) {
      query.role = role;
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true' || isBlocked === true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('clinicId', 'name uniqueClinicId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).select('-password').populate('clinicId');
    if (!user || user.isDeleted) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  static async blockUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    ).select('-password');

    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  static async unblockUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    ).select('-password');

    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  static async softDeleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { new: true }
    ).select('-password');

    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }
}

module.exports = UserService;
