import { supabase } from "./supabaseClient";
import { Request, Response } from "express";

export async function authMiddleware(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const tokenMatch = authHeader.match(/^Bearer (.+)$/i);

    if (!tokenMatch) {
        return res.status(401).json({ error: 'Malformed token header' });
    }

    const token = tokenMatch[1];

    const {
        data: { user },
        error
    } = await supabase.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
}