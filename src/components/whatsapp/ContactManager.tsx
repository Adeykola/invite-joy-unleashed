
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Tag,
  Upload,
  Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useEnhancedWhatsApp } from '@/hooks/useEnhancedWhatsApp';

export const ContactManager = () => {
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    phone_number: '',
    email: '',
    tags: ''
  });

  const { contacts, addContact, isAddingContact } = useEnhancedWhatsApp();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddContact = () => {
    const contactData = {
      ...newContact,
      tags: newContact.tags ? newContact.tags.split(',').map(tag => tag.trim()) : []
    };
    
    addContact(contactData);
    setNewContact({ name: '', phone_number: '', email: '', tags: '' });
    setIsAddContactOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Contact Management ({contacts.length})
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                    <DialogDescription>
                      Add a new contact to your WhatsApp contact list.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={newContact.phone_number}
                        onChange={(e) => setNewContact({...newContact, phone_number: e.target.value})}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={newContact.tags}
                        onChange={(e) => setNewContact({...newContact, tags: e.target.value})}
                        placeholder="vip, customer, event-guest"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddContactOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddContact}
                      disabled={!newContact.name || !newContact.phone_number || isAddingContact}
                    >
                      {isAddingContact ? 'Adding...' : 'Add Contact'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      <Card>
        <CardContent className="p-0">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No contacts found matching your search.' : 'No contacts added yet.'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{contact.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {contact.phone_number}
                            </div>
                            {contact.email && (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {contact.email}
                              </div>
                            )}
                          </div>
                          {contact.tags.length > 0 && (
                            <div className="flex items-center space-x-1 mt-2">
                              <Tag className="h-3 w-3 text-gray-400" />
                              {contact.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
