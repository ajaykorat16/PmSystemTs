import Users from "../models/user";
import Leaves from "../models/leave";
import LeaveManagement from "../models/leaveManagement";


const carryForwardLeaves = async (): Promise<void> => {
    try {
        const allUsers = await Users.find({ role: "user" }).select("_id fullName carryForward");
        const currentDate = new Date();
        const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

        for (const user of allUsers) {
            const getLeaves = await Leaves.aggregate([
                {
                    $match: {
                        userId: user._id,
                        status: "approved",
                        startDate: {
                            $gte: oneYearAgo,
                        },
                    },
                },
                {
                    $group: {
                        _id: '$userId',
                        totalLeaves: { $sum: '$totalDays' },
                    },
                },
            ]);

            const previousYearLeaves = await LeaveManagement.aggregate([
                {
                    $match: { user: user._id },
                },
                {
                    $group: {
                        _id: '$user',
                        leave: { $sum: '$leave' },
                    },
                },
            ]);

            for (const lastLeaves of previousYearLeaves) {
                for (const leave of getLeaves) {
                    const finalTotal = (user.carryForward + lastLeaves.leave) - leave.totalLeaves;
                    const carryForwardLeave = finalTotal >= 5 ? 5 : finalTotal >= 0 ? finalTotal : 0;
                    await Users.findByIdAndUpdate(user._id, {
                        $set: { carryForward: carryForwardLeave, leaveBalance: carryForwardLeave },
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

// carryForwardLeaves();

const createMonthly = async (): Promise<void> => {
    try {
        let today = new Date('2023-11-01');
        let leave = 1.5;
        const allUsers = await Users.find({ role: "user" }).select("_id fullName carryForward");
        for (const e of allUsers) {
            await new LeaveManagement({ user: e._id, monthly: today, leave }).save();
            await Users.findByIdAndUpdate(e._id, { $inc: { leaveBalance: leave } }, { new: true });
        }
    } catch (error) {
        console.log(error);
    }
};

// createMonthly();

export { carryForwardLeaves, createMonthly };
