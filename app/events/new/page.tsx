import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEventAction } from "@/lib/actions/events";
import Link from "next/link";

export default async function NewEventPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>イベント新規作成</CardTitle>
        </CardHeader>

        <CardContent>
          <Form action={createEventAction}>
            <FormField>
              <Label>イベント名</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="開催するイベント名を入力してください..."
              />
            </FormField>

            <FormField>
              <Label htmlFor="description">イベントの概要</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="イベントの概要を入力してください..."
              />
            </FormField>

            <FormField>
              <Label htmlFor="location">開催場所</Label>
              <Input
                id="location"
                name="location"
                placeholder="開催場所を入力してください..."
              />
            </FormField>

            <FormField>
              <Label htmlFor="eventDate">開催日時</Label>
              <Input id="eventDate" name="eventDate" type="datetime-local" />
              <FormMessage>※あとから変更可能です（入力は任意です）</FormMessage>
            </FormField>

            <div className="flex items-center gap-3">
              <Button type="submit">イベント作成</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={"/dashboard"}>Cancel</Link>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}