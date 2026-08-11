import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';

export default function CreativeNook() {
  const [books, setBooks] = useLocalStorage('nook-books', []);
  const [book, setBook] = useState('');
  const [watch, setWatch] = useLocalStorage('nook-watch', []);
  const [w, setW] = useState('');
  const [vision, setVision] = useLocalStorage('nook-vision', []);

  const addBook = () => {
    if (book.trim()) {
      setBooks([...books, { id: Date.now(), title: book.trim(), done: false }]);
      setBook('');
    }
  };
  const addWatch = () => {
    if (w.trim()) {
      setWatch([...watch, { id: Date.now(), title: w.trim(), done: false }]);
      setW('');
    }
  };
  const addVision = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setVision([...vision, file_url]);
  };

  return (
    <StudioShell title="Creative Nook & Library">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Bookshelf</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={book} onChange={(e) => setBook(e.target.value)} placeholder="Add a book" className="rounded-full" onKeyDown={(e) => e.key === 'Enter' && addBook()} />
            <Button size="sm" onClick={addBook} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {books.map((b) => (
            <div key={b.id} className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setBooks((bs) => bs.map((x) => (x.id === b.id ? { ...x, done: !x.done } : x)))}
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  b.done ? 'bg-primary border-primary' : 'border-border'
                }`}
              >
                {b.done && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </button>
              <span className={b.done ? 'line-through text-muted-foreground' : ''}>{b.title}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Watchlist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={w} onChange={(e) => setW(e.target.value)} placeholder="Add to watchlist" className="rounded-full" onKeyDown={(e) => e.key === 'Enter' && addWatch()} />
            <Button size="sm" onClick={addWatch} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {watch.map((x) => (
            <p key={x.id} className="text-sm">
              {x.title}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Vision Board</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-primary">
            <Plus className="w-4 h-4" /> Add image
            <input type="file" accept="image/*" className="hidden" onChange={addVision} />
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {vision.map((v, i) => (
              <img key={i} src={v} alt="vision" className="aspect-square object-cover rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </StudioShell>
  );
}