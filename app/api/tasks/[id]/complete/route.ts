import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    const taskId = context.params.id;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { completed: true },
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Error completing task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
