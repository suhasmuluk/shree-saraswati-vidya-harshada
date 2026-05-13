import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Phone, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';

const Parents = () => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const { t } = useLanguage();

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data ?? [];
    },
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students-parents'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*, classes(name)').eq('is_active', true).order('parent_name');
      return data ?? [];
    },
  });

  const parentMap = new Map<string, any[]>();
  students.forEach((s: any) => {
    const key = `${s.parent_name}-${s.parent_phone}`;
    if (!parentMap.has(key)) parentMap.set(key, []);
    parentMap.get(key)!.push(s);
  });

  const filteredParents = Array.from(parentMap.entries()).filter(([key, children]) => {
    const matchesSearch = key.toLowerCase().includes(search.toLowerCase()) ||
      children.some((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));
    const matchesClass = classFilter === 'all' || children.some((c: any) => c.class_id === classFilter);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('parents.title')}</h1>
        <p className="text-muted-foreground">{t('parents.subtitle')}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('parents.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder={t('students.allClasses')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('students.allClasses')}</SelectItem>
            {classes.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p className="text-muted-foreground">{t('common.loading')}</p> : filteredParents.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">{t('parents.noParents')}</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filteredParents.map(([key, children]) => (
            <Card key={key} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{children[0].parent_name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{children[0].parent_phone}</span>
                      {children[0].address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{children[0].address}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {children.map((c: any) => (
                      <span key={c.id} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {c.name} • {(c.classes as any)?.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Parents;
