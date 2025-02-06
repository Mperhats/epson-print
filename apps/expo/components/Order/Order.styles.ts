import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  orderDetailsContent: {
    padding: 16,
  },
  orderNotesContainer: {
    padding: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  orderNoteText: {
    paddingLeft: 10,
  },
  productItemContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 5,
  },
  productQuantityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productName: {
    marginLeft: 10,
    maxWidth: '80%',
  },
  productPrice: {
    alignSelf: 'flex-start',
  },
  modifiersContainer: {
    marginLeft: 44,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modifierGroup: {
    marginBottom: 4,
  },
  modifierItem: {
    paddingBottom: 4,
  },
  specialInstructions: {
    alignItems: 'flex-start',
    paddingBottom: 8,
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    width: 85,
    marginHorizontal: 20,
  },
  quantityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    aspectRatio: 1,
    padding: 5,
  },
});
