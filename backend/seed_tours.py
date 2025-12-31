import os
import django
import uuid
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings.development')
django.setup()

from apps.tours.models import Destination, Tour

def seed_data():
    print("Seeding data...")
    
    # Create Destinations if not exist
    destinations_data = [
        {'name': 'Shimla', 'country': 'India', 'description': 'The Queen of Hills'},
        {'name': 'Manali', 'country': 'India', 'description': 'Valley of the Gods'},
        {'name': 'Kashmir', 'country': 'India', 'description': 'Heaven on Earth'},
        {'name': 'Goa', 'country': 'India', 'description': 'Beach Paradise'},
        {'name': 'Kerala', 'country': 'India', 'description': "God's Own Country"},
    ]
    
    destinations = {}
    for data in destinations_data:
        dest, created = Destination.objects.get_or_create(
            name=data['name'],
            defaults={
                'country': data['country'],
                'description': data['description'],
                'is_active': True
            }
        )
        destinations[data['name']] = dest
        if created:
            print(f"Created destination: {dest.name}")

    # Create Tours
    tours_data = [
        {
            'name': 'Shimla & Manali Delight',
            'destination': destinations['Shimla'],
            'description': 'A beautiful journey through the hills of Shimla and Manali.',
            'duration_days': 6,
            'base_price': Decimal('25000.00'),
            'category': 'CULTURAL',
            'difficulty_level': 'EASY'
        },
        {
            'name': 'Kashmir Paradise Tour',
            'destination': destinations['Kashmir'],
            'description': 'Experience the serene beauty of Srinagar, Gulmarg, and Pahalgam.',
            'duration_days': 7,
            'base_price': Decimal('35000.00'),
            'category': 'RELAXATION',
            'difficulty_level': 'MODERATE'
        },
        {
            'name': 'Goa Beach Blast',
            'destination': destinations['Goa'],
            'description': 'Fun-filled vacation on the sunny beaches of Goa.',
            'duration_days': 4,
            'base_price': Decimal('15000.00'),
            'category': 'RELAXATION',
            'difficulty_level': 'EASY'
        },
        {
            'name': 'Backwaters of Kerala',
            'destination': destinations['Kerala'],
            'description': 'A peaceful retreat in the backwaters and hills of Kerala.',
            'duration_days': 5,
            'base_price': Decimal('22000.00'),
            'category': 'RELAXATION',
            'difficulty_level': 'EASY'
        }
    ]

    for data in tours_data:
        tour, created = Tour.objects.get_or_create(
            name=data['name'],
            defaults={
                'destination': data['destination'],
                'description': data['description'],
                'duration_days': data['duration_days'],
                'base_price': data['base_price'],
                'category': data['category'],
                'difficulty_level': data['difficulty_level'],
                'is_active': True
            }
        )
        if created:
            print(f"Created tour: {tour.name}")

    print("Seeding complete!")

if __name__ == '__main__':
    seed_data()
