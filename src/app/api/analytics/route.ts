import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectMongoDB from '@/lib/db/mongodb'
import Project from '@/models/Project'
import Task from '@/models/Task'
import { createApiResponse } from '@/lib/utils'
import { withRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const rateCheck = await withRateLimit(request, 50)
    if (!rateCheck.success) {
      return NextResponse.json(
        createApiResponse(false, null, rateCheck.error),
        { status: 429 }
      )
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        createApiResponse(false, null, 'Unauthorized'),
        { status: 401 }
      )
    }

    await connectMongoDB()

    // Get projects user has access to
    const userProjects = await Project.find({
      $or: [
        { ownerId: userId },
        { teamMembers: { $in: [userId] } }
      ]
    }).select('_id').lean()

    const projectIds = userProjects.map(p => p._id)

    // Project Analytics
    const projectStats = await Project.aggregate([
      {
        $match: {
          $or: [
            { ownerId: userId },
            { teamMembers: { $in: [userId] } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          archivedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          },
          averageProgress: { $avg: '$progress' }
        }
      }
    ])

    const projectsByPriority = await Project.aggregate([
      {
        $match: {
          $or: [
            { ownerId: userId },
            { teamMembers: { $in: [userId] } }
          ]
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ])

    // Task Analytics
    const taskStats = await Task.aggregate([
      {
        $match: {
          $or: [
            { assigneeId: userId },
            { reporterId: userId },
            { projectId: { $in: projectIds } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          todoTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          reviewTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] }
          },
          doneTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
          }
        }
      }
    ])

    const tasksByPriority = await Task.aggregate([
      {
        $match: {
          $or: [
            { assigneeId: userId },
            { reporterId: userId },
            { projectId: { $in: projectIds } }
          ]
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ])

    // Overdue tasks
    const overdueTasks = await Task.countDocuments({
      $or: [
        { assigneeId: userId },
        { reporterId: userId },
        { projectId: { $in: projectIds } }
      ],
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    })

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentProjects = await Project.find({
      $or: [
        { ownerId: userId },
        { teamMembers: { $in: [userId] } }
      ],
      createdAt: { $gte: thirtyDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    const recentTasks = await Task.find({
      $or: [
        { assigneeId: userId },
        { reporterId: userId },
        { projectId: { $in: projectIds } }
      ],
      createdAt: { $gte: thirtyDaysAgo }
    })
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Productivity metrics (tasks completed per day for the last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const completedTasksDaily = await Task.aggregate([
      {
        $match: {
          assigneeId: userId,
          status: 'done',
          updatedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$updatedAt'
            }
          },
          count: { $sum: 1 },
          totalHours: { $sum: '$actualHours' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    const analytics = {
      projects: {
        total: projectStats[0]?.totalProjects || 0,
        active: projectStats[0]?.activeProjects || 0,
        completed: projectStats[0]?.completedProjects || 0,
        archived: projectStats[0]?.archivedProjects || 0,
        averageProgress: projectStats[0]?.averageProgress || 0,
        byPriority: projectsByPriority.reduce((acc: any, item) => {
          acc[item._id] = item.count
          return acc
        }, {})
      },
      tasks: {
        total: taskStats[0]?.totalTasks || 0,
        todo: taskStats[0]?.todoTasks || 0,
        inProgress: taskStats[0]?.inProgressTasks || 0,
        review: taskStats[0]?.reviewTasks || 0,
        done: taskStats[0]?.doneTasks || 0,
        overdue: overdueTasks,
        completionRate: taskStats[0]?.totalTasks > 0 
          ? ((taskStats[0]?.doneTasks || 0) / taskStats[0]?.totalTasks * 100).toFixed(2)
          : '0',
        byPriority: tasksByPriority.reduce((acc: any, item) => {
          acc[item._id] = item.count
          return acc
        }, {})
      },
      recent: {
        projects: recentProjects,
        tasks: recentTasks
      },
      productivity: completedTasksDaily
    }

    return NextResponse.json(createApiResponse(true, analytics))
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      createApiResponse(false, null, 'Internal server error'),
      { status: 500 }
    )
  }
}