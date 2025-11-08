import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from civicapi.models import User

def setup_test_users():
    test_users = [
        {'email': 'testing@gmail.com', 'password': 'testing'},
        {'email': 'admin@gmail.com', 'password': 'admin'},

    ]
    
    print("\nCreating users in SQLite database...")
    
    for user_data in test_users:
        if User.objects.filter(email=user_data['email']).exists():
            print(f"SKIP: {user_data['email']} already exists")
            continue
        
        user = User.objects.create(email=user_data['email'])
        user.set_password(user_data['password'])
        user.save()
        
        print(f"CREATED: {user_data['email']} / {user_data['password']}")
    
    print(f"\nTotal users: {User.objects.count()}\n")

if __name__ == '__main__':
    setup_test_users()