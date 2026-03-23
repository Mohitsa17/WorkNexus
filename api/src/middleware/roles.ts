import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { supabase } from '../lib/supabase'

export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const workspaceId = req.params.workspaceId || req.body.workspaceId

    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId is required' })
    }

    const { data: member, error } = await supabase
      .from('WorkspaceMember')
      .select('role')
      .eq('userId', req.userId!)
      .eq('workspaceId', workspaceId)
      .single()

    if (error || !member) {
      return res.status(403).json({ error: 'You are not a member of this workspace' })
    }

    if (!roles.includes(member.role)) {
      return res.status(403).json({
        error: `This action requires ${roles.join(' or ')} role. You are a ${member.role}.`
      })
    }

    next()
  }
}