import { useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Search, Pencil } from 'lucide-react';
import { Supplier } from '@/types/pharmacy';

export default function Suppliers() {
  const { suppliers, addSupplier, deleteSupplier, updateSupplier } = usePharmacy();

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    gstNumber: '',
  });
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierData, setDeleteSupplierData] = useState<Supplier | null>(null);

  // 🔍 FILTER
  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  // 🟢 ADD SUPPLIER
  const handleAdd = async () => {
    const newSupplier: Supplier = {
      id: crypto.randomUUID(),
      name: form.name,
      contact: form.contact,
      email: form.email,
      address: form.address,
      gstNumber: form.gstNumber,
    };

    await addSupplier(newSupplier);

    setShowAdd(false);
    setForm({
      name: '',
      contact: '',
      email: '',
      address: '',
      gstNumber: '',
    });
  };

  // 🔴 DELETE SUPPLIER
  const handleDelete = async (supplier: Supplier) => {
    const confirmDelete = window.confirm(
      `Delete "${supplier.name}"?\nThis action cannot be undone.`
    );

    if (confirmDelete) {
      await deleteSupplier(supplier.id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header font-display">Suppliers</h1>
          <p className="page-description">
            Manage supplier information
          </p>
        </div>

        {/* ADD MODAL */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Add Supplier
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                Add New Supplier
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Company Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Contact</Label>
                  <Input
                    value={form.contact}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        contact: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      address: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>GST Number</Label>
                <Input
                  value={form.gstNumber}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      gstNumber: e.target.value,
                    }))
                  }
                />
              </div>

              <Button onClick={handleAdd} disabled={!form.name}>
                Add Supplier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={!!editSupplier} onOpenChange={() => setEditSupplier(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Supplier</DialogTitle>
    </DialogHeader>

    {editSupplier && (
      <div className="grid gap-4 py-4">
        <Input
          value={editSupplier.name}
          onChange={e =>
            setEditSupplier(p => p && { ...p, name: e.target.value })
          }
          placeholder="Company Name"
        />

        <Input
          value={editSupplier.contact}
          onChange={e =>
            setEditSupplier(p => p && { ...p, contact: e.target.value })
          }
          placeholder="Contact"
        />

        <Input
          value={editSupplier.email}
          onChange={e =>
            setEditSupplier(p => p && { ...p, email: e.target.value })
          }
          placeholder="Email"
        />

        <Input
          value={editSupplier.address}
          onChange={e =>
            setEditSupplier(p => p && { ...p, address: e.target.value })
          }
          placeholder="Address"
        />

        <Input
          value={editSupplier.gstNumber}
          onChange={e =>
            setEditSupplier(p => p && { ...p, gstNumber: e.target.value })
          }
          placeholder="GST Number"
        />

        <Button
          onClick={async () => {
            await updateSupplier(editSupplier);
            setEditSupplier(null);
          }}
        >
          Update Supplier
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>
<Dialog open={!!deleteSupplierData} onOpenChange={() => setDeleteSupplierData(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Supplier</DialogTitle>
    </DialogHeader>

    {deleteSupplierData && (
      <div className="space-y-4">
        <p>
          Are you sure you want to delete{" "}
          <strong>{deleteSupplierData.name}</strong>?
        </p>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteSupplierData(null)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={async () => {
              await deleteSupplier(deleteSupplierData.id);
              setDeleteSupplierData(null);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search suppliers..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">
                        {s.name}
                      </span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {s.address}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm">
                    {s.contact}
                  </TableCell>

                  <TableCell className="text-sm">
                    {s.email}
                  </TableCell>

                  <TableCell className="text-sm font-mono">
                    {s.gstNumber}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
  variant="ghost"
  size="icon"
  className="h-7 w-7"
  onClick={() => setEditSupplier(s)}
>
  <Pencil className="h-3.5 w-3.5" />
</Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                     onClick={() => setDeleteSupplierData(s)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}