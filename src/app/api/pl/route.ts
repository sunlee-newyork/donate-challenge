import { NextRequest, NextResponse } from "next/server";
import { getPL } from "@/app/_utils/pl";

type ResponseData = {
  message?: string;
  data?: {
    pl: number;
  };
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<ResponseData>> {
  try {
    setTimeout(() => {}, 1000);

    const address = req.nextUrl.searchParams.get("address");
    const [plError, pl] = await getPL(address as string);

    if (plError) {
      return NextResponse.json({ message: plError.message }, { status: 500 });
    } else {
      return NextResponse.json({ data: { pl } }, { status: 200 });
    }
  } catch (error) {
    const errorMessage = `Failed to process p&l: ${
      (error as Error).message || JSON.stringify(error)
    }`;
    console.error(errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export const runtime = "nodejs";
