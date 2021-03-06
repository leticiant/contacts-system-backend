import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonsService } from 'src/persons/persons.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactRepository } from './repositories/contact.repository';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactRepository)
    private contactRepository: ContactRepository,
    private personsService: PersonsService,
  ) {}

  async create(createContactDto: CreateContactDto) {
    const person = await this.personsService.findOne(createContactDto.idPerson);

    if (!createContactDto.name)
      throw new BadRequestException("Field 'name' is required");

    const contact = this.contactRepository.create({
      ...createContactDto,
      person,
    });

    try {
      await this.contactRepository.save(contact);
    } catch (error) {
      throw new BadRequestException('Could not insert contact');
    }
  }

  async findAllByIdPerson(idPerson: string) {
    if (!idPerson)
      throw new BadRequestException("Param 'idPerson' is required");

    return await this.contactRepository.find({
      where: {
        person: {
          id: idPerson,
        },
      },
    });
  }

  async findOne(id: string) {
    const contact = await this.contactRepository.findOne(id);
    if (!contact) {
      throw new BadRequestException('Contact not found');
    }

    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    const contact = this.contactRepository.create(updateContactDto)
    try {
      await this.contactRepository
        .createQueryBuilder()
        .update()
        .set({ ...contact })
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      throw new BadRequestException('Could not update contact');
    }
  }

  async remove(id: string) {
    const result = await this.contactRepository.delete({ id });
    if (!result.affected) {
      throw new BadRequestException('Could not delete contact');
    }
  }
}
