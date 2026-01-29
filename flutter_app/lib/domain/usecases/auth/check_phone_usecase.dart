import '../entities/user.dart';
import '../../repositories/auth_repository.dart';
import 'package:dartz/dartz.dart';

class CheckPhoneUseCase {
  final AuthRepository _repository;
  
  CheckPhoneUseCase(this._repository);
  
  Future<Either<Failure, PhoneCheckResponseEntity>> execute(String phone) async {
    try {
      if (phone.isEmpty) {
        return Left(Failure('Telefon raqami kiritilishi shart'));
      }
      
      final response = await _repository.checkPhone(phone);
      final entity = PhoneCheckResponseEntity.fromModel(response);
      
      return Right(entity);
    } catch (e) {
      return Left(Failure(e.toString()));
    }
  }
}

class PhoneCheckResponseEntity {
  final bool exists;
  final bool isEmailUser;
  final bool isPhoneUser;
  final String? maskedEmail;
  final String? maskedPhone;
  
  const PhoneCheckResponseEntity({
    required this.exists,
    this.isEmailUser = false,
    this.isPhoneUser = false,
    this.maskedEmail,
    this.maskedPhone,
  });
  
  // Convert from model
  factory PhoneCheckResponseEntity.fromModel(PhoneCheckResponse model) {
    return PhoneCheckResponseEntity(
      exists: model.exists,
      isEmailUser: model.isEmailUser,
      isPhoneUser: model.isPhoneUser,
      maskedEmail: model.maskedEmail,
      maskedPhone: model.maskedPhone,
    );
  }
}

class Failure {
  final String message;
  
  const Failure(this.message);
  
  @override
  String toString() => message;
}
