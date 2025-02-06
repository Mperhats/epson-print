import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  closeButton: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
